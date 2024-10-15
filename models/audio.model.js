import mongoose, { Schema } from "mongoose";

const audioSchema = new mongoose.Schema({
    name:{
        type:String
    },
    thumbnail:{
        type:String
    },
    uniquename:{
        type:String
    },
    audiourl:{
        type:String,
        required:true
    },
    duration:{
        type:Number
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})
export const Audio=mongoose.model("Audio",audioSchema)