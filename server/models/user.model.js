import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: "Project",
    }],
    refreshToken: {
        type: String,
    }
})

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const User = mongoose.model("User", userSchema)