import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email:{
        type:String
    },
    otp:{
        type:Number
    },
    createAt:{
        type:Date,
        default:Date.now,
        index:{
            expires:"5min"
        }
    }
})


export const Otp= mongoose.model('Otp',otpSchema)