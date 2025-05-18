import { Router } from "express";
import { getCurrentUser, login, refreshAccessToken, register } from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/Auth.middleware.js";


const userRouter = Router()

userRouter.route("/register").post(register)
userRouter.route("/login").post(login)
userRouter.route("/getCurrentUser").get(verifyUser, getCurrentUser)
userRouter.route("/refreshAccessToken").get(refreshAccessToken)

export default userRouter