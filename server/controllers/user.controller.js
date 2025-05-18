import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const AccessTokenOptions = {
    // httpOnly: true,
    maxAge: 86400000,
    // secure: false
}
const RefreshTokenOptions = {
    // httpOnly: true,
    maxAge: (86400000 * 7),
    // secure: false
}

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(402, error.message)
    }
}

const register = asyncHandler(async (req, res) => {
    const {username, fullname, password} = req.body;
    if([username, fullname, password].some(field => field.trim() == "")){
        throw new ApiError(400, "All the fields are required !")
    }

    const oldUser = await User.findOne({username})

    if(oldUser){
        throw new ApiError(401, "User with this username already exists !")
    }
    const newUser = await User.create({fullname, username, password})
    const {accessToken, refreshToken} = await generateTokens(newUser._id)
    newUser.refreshToken = refreshToken;
    await newUser.save()

    res
    .status(200)
    .cookie("accessToken", accessToken, AccessTokenOptions)
    .cookie("refreshToken", refreshToken, RefreshTokenOptions)
    .json(new ApiResponse(200, newUser, "User created successfully !"))
})

const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;
    if([username, password].some(field => field.trim() == "")){
        throw new ApiError(400, "All the fields are required !")
    }
    const user = await User.findOne({username, password})
    if(!user){
        throw new ApiError(403, "User credentials are wrong")
    }
    const {accessToken, refreshToken} = await generateTokens(user._id)
    user.refreshToken = refreshToken
    await user.save()

    res
    .status(200)
    .cookie("accessToken", accessToken, AccessTokenOptions)
    .cookie("refreshToken", refreshToken, RefreshTokenOptions)
    .json(new ApiResponse(200, user, "User logged in successfully !"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "Got the current user !"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const oldRefToken = req.cookies?.refreshToken
    if(!oldRefToken) throw new ApiError(406, "Refresh Token not available");
    const decodedRefToken = jwt.decode(oldRefToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedRefToken._id)
    if(!user) throw new ApiError(403, "User not found");

    if(user.refreshToken == oldRefToken){
        const { accessToken } = await generateTokens(user._id)
        res
        .status(200)
        .cookie("accessToken", accessToken, AccessTokenOptions)
        .json(200, {}, "Access Token refreshed")
    }
    throw new ApiError(402, "Refresh token doesn't matched !!")
})

export {
    register,
    login,
    getCurrentUser,
    refreshAccessToken
}