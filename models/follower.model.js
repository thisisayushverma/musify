import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
    follower:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    following:{
        type: mongoose.Schema.ObjectId,
        ref:'User'
    }
})

 export const Follow = mongoose.model("Follow" , followSchema)