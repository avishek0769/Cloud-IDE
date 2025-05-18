import express from "express";
import http from "http"
import {Server} from "socket.io"
import cors from "cors"
import { exec, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import chokidar from "chokidar"

const child = spawn("/bin/bash", [], { // Change this for ubuntu
    cwd: "/user",
    shell: "/bin/bash",
    stdio: ["pipe", "pipe", "pipe"]
})

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: /\.devtunnels\.ms$/,
        credentials: true,
        methods: ["GET", "POST", "DELETE", "PATCH", "PUT"]
    }
})
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use(cors({
    origin: /\.devtunnels\.ms$/,
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}));

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
});

chokidar.watch("./user").on("all", (event, path) => {
    if(event == "add" || event == "addDir" || event == "unlink" || event == "unlinkDir" ) {
        io.emit("file:refresh", "do a refresh");
    }
})

let commandSocketMap = new Map()
child.stderr.on("data", (data) => {
    io.emit("terminal:output", data.toString())
    console.error("Child Process err --> ", data.toString())
})

let outputBuffer = ""
child.stdout.on("data", (data) => {
    let output = data.toString().split("\n").join(" ");
    outputBuffer += output;
    const match = output.match(/__CMD_END__(\w+)/);

    if(match){
        console.log("Match --> ", match)
        const socketId = commandSocketMap.get(match[1])
        io.to(socketId).emit("terminal:output", outputBuffer.replace(/__CMD_END__\w+/, ""))
        commandSocketMap.delete(match[1]);
        outputBuffer = "";
    }
    console.log("Output --> ", output)
})

let socketToFilePath = new Map()
io.on("connection", (socket) => {
    socketToFilePath.set(socket.id, "")

    socket.on("terminal:write", (data) => {
        if(data == '\n'){
            socket.emit("terminal:output", "ubuntu@user> ")
        }
        else {
            const commandId = Math.random().toString(36).substr(2, 9)
            commandSocketMap.set(commandId, socket.id)
            child.stdin.write(data)
            child.stdin.write(`echo __CMD_END__${commandId}\n`)
        }
    })
    socket.on("file:write", async ({content, path}) => {
        console.log(socket.id, "==>", content)
        let filePath = "/user" + path
        await fs.writeFile(filePath, content, {encoding: "utf-8"})
    })
    socket.on("fetch:code", async (path) => {
        let filePath = "/user" + path
        const data = await fs.readFile(filePath, {encoding: "utf-8"})
        socketToFilePath.set(socket.id, filePath)
        socket.emit("fetched:code", data)
    })
    socket.on("code:run", ({filePath, fileType}) => { // Here replace the .exe --> .out, and the ./
        console.log(filePath)
        if(fileType == "c" || fileType == "cpp"){
            let outputFilename = filePath.split("/").slice(-1)[0].split(".")[0]
            let command = `${fileType == "c"? "gcc" : "g++"} user${filePath} -o user${filePath.split("/").slice(0, -1).join("/")}/${outputFilename}.out`

            exec(command, (err) => {
                if(err) {
                    console.log("err --> ", err)
                    socket.emit("terminal:output", err.toString())
                    return
                }
                let command2 = `/user${filePath.split("/").slice(0, -1).join("/")}/${outputFilename}.out`
                console.log(command2)
                exec(command2, (err2, stdout2) => {
                    if(err2){
                        console.log("err2 -->", err2)
                        socket.emit("terminal:output", err2.toString())
                        return
                    }
                    socket.emit("terminal:output", stdout2)
                    // console.log(stdout2)
                })
            })
        }
        else if(fileType == "js"){
            let command = `node user${filePath}`
            exec(command, (err, stdout) => {
                if(err){
                    console.log("err --> ", err.toString())
                    socket.emit("terminal:output", err)
                    return
                }
                socket.emit("terminal:output", stdout)
            })
        }
    })
    socket.on("cursor-change:send", ({socketId, position}) => {
        let socketsWithSameFilePath = []
        const filePath = socketToFilePath.get(socketId)
        socketToFilePath.forEach((value, key, map) => {
            if(socketId != key && value == filePath){
                socketsWithSameFilePath.push(key)
            }
        })
        socketsWithSameFilePath.map(id => {
            io.to(id).emit("cursor-change:receive", position)
        })
    })
    socket.on("text-change:send", ({socketId, data}) => {
        let socketsWithSameFilePath = []
        const filePath = socketToFilePath.get(socketId)
        socketToFilePath.forEach((value, key, map) => {
            if(socketId != key && value == filePath){
                socketsWithSameFilePath.push(key)
            }
        })
        socketsWithSameFilePath.map(id => {
            io.to(id).emit("text-change:receive", data)
        })
        console.log("Data --> ", data)
        console.log("Map --> ", socketToFilePath)
        console.log("Array --> ", socketsWithSameFilePath)
    })
    socket.on("disconnect", (reason) => {
        socketToFilePath.delete(socket.id)
    })
})

app.get("/files", async (req, res) => {
    const fileTree = await generateFileTree("./user")
    res.status(200).json({tree: fileTree})
})

app.get("/get-connected-sockets", (req, res) => {
    const obj = Object.fromEntries(socketToFilePath)
    res.status(200).json(obj)
})

async function generateFileTree (directory) {
    let tree = {}

    async function buildTree (currentDir, currentTree) {
        const files = await fs.readdir(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file)
            const stat = await fs.stat(filePath)
            if(stat.isDirectory()) {
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            }
            else{
                currentTree[file] = null
            }
        }
    }
    await buildTree(directory, tree)
    return tree
}

server.listen(3000, () => {
    console.log("Docker Server running at 3000....")
})