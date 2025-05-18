import mongoose, {Schema} from "mongoose";

const projectSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        enum: ['ts', 'js', 'py', 'c', 'cpp','java', 'go', 'rust'],
        required: true,
    },
    instanceURL: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true
    },
    containerId: {
        type: String,
    },
    lastOpened: {
        type: Number,
        required: true,
    },
    sharedTo: [{
        type: Schema.Types.ObjectId,
        ref : "User"
    }],
    tokenOfProof: {
        type: String,
        default: null
    }
})

export const Project = mongoose.model("Project", projectSchema)