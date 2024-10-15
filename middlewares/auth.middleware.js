import { apiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

export const verifyJWT = asynHandler(async(req,res,next)=>{
    try {
        const accessTokenFromUser = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ","")
        
        if(!accessTokenFromUser){
            throw new apiError(402,"There is no token from the user or Unauthorized request")
        }
    
        const verifiedToken = jwt.verify(accessTokenFromUser,process.env.ACCESS_TOKEN)
    
        const user =await User.findById(verifiedToken?._id).select(
            "-password -refreshtoken"
        )
    
        if(!user){
            throw new apiError(401,"Invalid Access Token")
        }
    
    
        req.user = user
        next()
    } catch (error) {
        throw new apiError(400,"Error while Authorization")
    }

})

