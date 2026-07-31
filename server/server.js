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

const allowedOrigins = [
    /localhost:\d+$/,
    /\.devtunnels\.ms$/,
    /\.ngrok-free\.app$/,
    /\.ngrok\.io$/
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(regex => regex.test(origin));
        if (isAllowed) {
            callback(null, true);
        } else {
            // Fallback to allow any origin in development
            callback(null, true);
        }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type, Authorization, ngrok-skip-browser-warning"
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