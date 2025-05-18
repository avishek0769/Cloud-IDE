import { Router } from "express";
import { createNewProject, deleteProject, editMetaData, generateLink, getProjects, refreshInstanceUrl, startContainer, stopContainer, stopRunningContainers } from "../controllers/project.controller.js";
import { verifyUser } from "../middlewares/Auth.middleware.js";


const projectRouter = Router()

projectRouter.route("/create").post(verifyUser, createNewProject)
projectRouter.route("/get/:category").get(verifyUser, getProjects)
projectRouter.route("/startContainer/:containerId").get(verifyUser, startContainer)
projectRouter.route("/stopRunningContainers").get(verifyUser, stopRunningContainers)
projectRouter.route("/stopContainer/:containerId").get(verifyUser, stopContainer)
projectRouter.route("/edit/:projectId").patch(verifyUser, editMetaData)
projectRouter.route("/delete/:projectId").delete(verifyUser, deleteProject)
projectRouter.route("/generateSharableLink/:containerId").get(verifyUser, generateLink)
projectRouter.route("/refreshInstanceUrl/:containerId").get(verifyUser, refreshInstanceUrl)

export default projectRouter