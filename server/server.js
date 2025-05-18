import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {errorHandler} from "./utils/errorHandler.js"
import dotenv from "dotenv"
import mongoose from "mongoose";

dotenv.config({
    path: "./.env"
})

const app = express()
app.use(cors({
    origin: /\.devtunnels\.ms$/,
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type, Authorization"
}));

app.options("*", cors());
app.use(json())
app.use(cookieParser())
app.use(urlencoded({limit: "10mb"}))

// All the routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter)

import projectRouter from "./routes/project.routes.js";
app.use("/api/v1/projects", projectRouter)

app.use(errorHandler)

app.listen(4000, () => {
    console.log("Actual Server running at 4000....")
    // Connect DB
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(_ => console.log("DB connected !"))
})