import { asynHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadoncloudinary } from "../utils/cloudnary.js";
import apiResponse from "../utils/apiResponse.js";

const registerUser = asynHandler(async (req,res)=>{
    const {fullname , email , password} =  req.body
    if(!fullname || !email)
        throw new apiError(400, "Credential is not found")

    console.log(`${email} , ${fullname}`);

    // check user is already register or not
    
    const userfound =await User.findOne({
        email: email
    })

    if(userfound){
        throw new apiError(401,"User already existed")
    }

    // console.log("you are new here");

    const avatarlocatpath = req.file?.path
    
    if(!avatarlocatpath)
        throw new apiError(401, "Avatar image is not found")

    const avatar = await uploadoncloudinary(avatarlocatpath)

    // console.log(avatar); user avatar print

    if(!avatar)
        throw new apiError(400,"Avatar is not found")

    const user = await User.create({
        fullname,
        email,
        password,
        "avatar" : avatar.url
    })
    // console.log(user);  created user print

    const userCreated = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if(!userCreated) throw new apiError(500,"User didn't created")

    return res
    .status(200)
    .json(new apiResponse(200,userCreated,"User Created Successfully"))


})


export {registerUser}
