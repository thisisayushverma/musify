import mongoose, { Schema } from "mongoose";

const audioSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    audiofile:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})




export const Audio=mongoose.model("Audio",audioSchema)