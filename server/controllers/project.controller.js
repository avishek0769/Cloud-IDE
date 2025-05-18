import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import Docker from "dockerode"
import findOpenPort from "find-open-port"
import ngrok from "@ngrok/ngrok"
import { v4 as uuidv4 } from "uuid"

const docker = new Docker()

const exposePort = async (project) => {
    const listener = await ngrok.connect({
        proto: "http",
        authtoken: process.env.NGROK_AUTH_TOKEN,
        addr: project.port
    })
    project.instanceURL = listener.url()
    await project.save()
    return listener.url()
}

const createNewProject = asyncHandler(async (req, res) => {
    const { name, description, language } = req.body;
    
    const port = await findOpenPort()
    console.log(port)
    const container = await docker.createContainer({
        Image: "ide-image:latest",
        Tty: true,
        Env: [`ENV_TYPE=${language}`],
        HostConfig: {
            PortBindings: {
                "3000/tcp": [{HostPort: port.toString()}]
            }
        },
        ExposedPorts: {
            "3000/tcp": {}
        }
    })
    const listener = await ngrok.connect({
        proto: "http",
        authtoken: process.env.NGROK_AUTH_TOKEN,
        addr: port
    })
    const project = await Project.create({
        owner: req.user._id,
        name,
        description,
        language,
        instanceURL: listener.url(),
        lastOpened: Date.now(),
        port,
        containerId: container.id
    })
    await User.findByIdAndUpdate(
        req.user._id,
        { $push: { projects: project._id } },
        { new: true }
    )
    
    res.status(200).json(new ApiResponse(200, project, "New Project created"))
})

const getProjects = asyncHandler(async (req, res) => {
    const { category } = req.params
    const userId = req.user._id
    let filteredProjects;

    if(category == "your"){
        filteredProjects = await User.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "projects",
                    foreignField: "_id",
                    localField: "projects",
                    as: "projects"
                }
            }
        ])
        filteredProjects = filteredProjects[0].projects
    }
    else {
        filteredProjects = await Project.find({ sharedTo: userId })
    }

    res.status(200).json(new ApiResponse(200, filteredProjects, "Projects fetched for this user"))
})

const startContainer = asyncHandler(async (req, res) => {
    const { containerId } = req.params;
    const { token } = req.query;
    let isOk = false

    const project = await Project.findOneAndUpdate(
        { containerId },
        { lastOpened: Date.now() },
        { new: true }
    )

    if(token){
        if(token == project.tokenOfProof){
            project.sharedTo.push(req.user._id)
            isOk = true
        }
        else throw new ApiError(474, "Token is invalid");
    }
    else {
        if(project.owner != req.user._id) {
            isOk = true
        }
        else throw new ApiError(475, "You are Unauthorised");
    }
    if(isOk){
        const container = docker.getContainer(containerId)
        const data = await container.inspect()
        if(!data.State.Running){
            await container.start()
            console.log(await exposePort(project))
        }
        
        container.logs({follow: true, stderr: true, stdout: true}, (err, stream) => {
            if(err) throw new ApiError(501, err.message);

            const handleLogs = (chunk) => {
                console.log(chunk.toString())
                if(chunk.toString().includes("Docker Server running")){
                    res.status(200).json(new ApiResponse(200, project, "Container has started !"))
                    stream.removeListener("data", handleLogs)
                }
            }

            stream.on("data", handleLogs)
        })
    }
})

const stopRunningContainers = asyncHandler(async (req, res) => {
    const projects = await Project.find({ owner: req.user._id })

    for (const project of projects) {
        if(project.tokenOfProof) {
            const tunnelCheck = await fetch(`${project.instanceURL}/files`)
            if(tunnelCheck.status != 404) {
                const tunnel = await ngrok.getListenerByUrl(project.instanceURL)
                await tunnel.close()
                const response = await fetch(`${project.instanceURL}/get-connected-sockets`)
                const connectedSockets = await response.json()
    
                if(connectedSockets.length <= 1) {
                    const container = docker.getContainer(project.containerId)
                    const containerInfo = await container.inspect()
                    if (containerInfo && containerInfo.State.Running) {
                        await container.stop();
                    }
                }
            }
        }
    }
    res.status(200).json(new ApiResponse(200, {}, "All running containers are stopped, If any"))
})

const stopContainer = asyncHandler(async (req, res) => {
    const { containerId } = req.params

    const project = await Project.findOne({ containerId })
    const tunnel = await ngrok.getListenerByUrl(project.instanceURL)
    await tunnel.close().catch(err => console.log("Tunnel Close error --> ", err))

    const response = await fetch(`${project.instanceURL}/get-connected-sockets`)
    const connectedSockets = await response.json()
    
    if(connectedSockets.length <= 1) {
        const container = docker.getContainer(containerId)
        const containerInfo = await container.inspect()
        if (!containerInfo || !containerInfo.State.Running) {
            return res.status(400).json(new ApiResponse(400, {}, "Container is not running!"));
        }
        await container.stop();
        return res.status(400).json(new ApiResponse(400, {}, "Container stopped!"));
    }
    res.status(200).json(new ApiResponse(200, {}, "People are working, didn't stop container"));
})

const editMetaData = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const { name, description, lastOpened} = req.body;

    let obj = {}
    if(name) obj["name"] = name;
    if(description) obj["description"] = description;
    if(lastOpened) obj["lastOpened"] = lastOpened;

    const project = await Project.findByIdAndUpdate(
        projectId,
        obj,
        { new: true }
    )
    res.status(200).json(new ApiResponse(200, project, "Project updated successfully"))
})

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);
    const tunnel = await ngrok.getListenerByUrl(project.instanceURL)
    await tunnel.close().catch(err => console.log("Tunnel Close error --> ", err))

    if(project){
        const container = docker.getContainer(project.containerId)
        await container.remove()
    }
    else throw new ApiError(503, "Project doesn't exists")

    res.status(200).json(new ApiResponse(200, {deleted: true}, "Project deleted successfully"))
})

const generateLink = asyncHandler(async (req, res) => {
    const { containerId } = req.params;

    const project = await Project.findOne({ containerId })

    const response = await fetch(`${project.instanceURL}/files`)
    if(response.status == 404){
        await exposePort(project)
    }

    let token = project.tokenOfProof;
    if(!token){
        token = uuidv4()
        project.tokenOfProof = token;
    }
    await project.save()

    res
    .status(200)
    .json(new ApiResponse(
        200,
        { url: `https://z1v3k1h4-5173.inc1.devtunnels.ms/playground?containerId=${containerId}&token=${token}` },
        `Port ${project.port} Exposed in the docker container`
    ))
})

const refreshInstanceUrl = asyncHandler(async (req, res) => {
    const { containerId } = req.params;
    if(!containerId) throw new ApiError(402, "Container ID is absent !");
    
    const project = await Project.findOne({ containerId });
    let url;
    const response = await fetch(project.instanceURL, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-type": "application/json"
        },
        credentials: "include"
    })
    if(response.status == 404){
        url = await exposePort(project)
    }

    res.status(200).json(new ApiResponse(200, { url }, "Instance URL refreshed"))
})

export {
    createNewProject,
    getProjects,
    startContainer,
    stopRunningContainers,
    stopContainer,
    editMetaData,
    deleteProject,
    generateLink,
    refreshInstanceUrl
}