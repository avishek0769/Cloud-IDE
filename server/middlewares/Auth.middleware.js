import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"


const verifyUser = async (req, res, next) => {
    try {
        const authToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!authToken) throw new ApiError(444, "Token is not available");
        
        const decodedToken = jwt.decode(authToken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if(!user) throw new ApiError(444, "User not found, accessToken is wrong !");
        
        req.user = user
        next()
    }
    catch (error) {
        if(error instanceof ApiError) next(error)
        else throw new ApiError(402, error.message);
    }
}

export { verifyUser }