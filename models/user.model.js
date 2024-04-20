import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minLength:[8,"Too Short"]
    },
    avatar:{
        type:String,
        required:true
    },
    geners:[{
        type:String
    }],
    refreshtoken:{
        type:String
    }
},{
    timestamps:true
})

userSchema.pre('save',async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10)
    }
})

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        fullname:this.fullname,
        email:this.email
    },
    process.env.ACCESS_TOKEN,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}


export const User = mongoose.model('User',userSchema)


