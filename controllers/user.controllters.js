import { asynHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadoncloudinary } from "../utils/cloudnary.js";
import apiResponse from "../utils/apiResponse.js";

import jwt from "jsonwebtoken"
import {sendmail} from "../utils/sendmail.js";
import { Otp } from "../models/otp.models.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";



const generateRandomNumber=()=>{
    let temp="123456789"
    let str=0
    for(let i=0;i<6;i++){
        let x=temp[Math.floor(Math.random()*9)] - '1'
        str=str*10+x
    }
    return str;
}


const generateAccessandRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()
        // console.log("rftoken",refreshToken);

        user.refreshtoken = refreshToken
        user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new apiError(500,"Something went while generating refresh token and access token")

    }
}


const sendOtptoRegister = asynHandler(async (req,res)=>{
    const email =  req.body.email
    // console.log(email);
    if(!email)
        throw new apiError(400, "Credential is not found")

    console.log(`${email}`);

    // check user is already register or not
    
    const userfound =await User.findOne({
        email: email
    })

    if(userfound){
        throw new apiError(401,"User already existed")
    }


    // console.log("you are new here");

    // const otp = Math.floor(Math.random()*1000000)
    const otp = generateRandomNumber()
    console.log(otp);

    try {
        sendmail(email,otp)
    } catch (error) {
        throw new apiError(500,`issues while sending mail`)
    }
    
    return res
    .status(200)
    .json(new apiResponse(200,{},"Verification email is sent"))


})

const createUser = asynHandler(async(req,res)=>{
    const {email,name,password } = req.body
    if(!email || !name || !password) throw new apiError(400,"Credentials not found")

    const checkUserExisted = await User.findOne({
        email:email,
    })
    const otp = generateRandomNumber()

    if(checkUserExisted){
        console.log(checkUserExisted.isverified);
        if(checkUserExisted.isverified == true){
            return res
            .status(400)
            .json(new apiResponse(400,{},"User already Created"))
        }
        else{
            const hashedPass = await bcrypt.hash(password,10)
            checkUserExisted.password=hashedPass
            await checkUserExisted.save()
            await Otp.findOneAndDelete({email:email})
        }
    }
    else{
        const newUser = await User.create({
            email,
            fullname:name,
            password:password
        })
    }


    const checkOtpCreated = await Otp.create({
        email,
        otp:otp
    })

    if(!checkOtpCreated) throw new apiError(500,"Otp able to created",error)

    try {
        sendmail(email,otp)
    } catch (error) {
        throw new apiError(500,`issues while sending mail`)
    }
    
    return res
    .status(200)
    .json(new apiResponse(200,{
        email:email,
    },"User Created and OTP send to your Mail ID so now Verified yourself"))
})

const verifyRegister = asynHandler(async(req,res)=>{
    const {email,otp} = req.body

    if(!email || !otp) throw new apiError(400,"Credentials not found")

    const otpuser =await Otp.findOne(
        {
            email:email
        }
    )

    if(!otpuser) throw new apiError(401,"Unauthorized access")

    console.log(Number(otpuser.otp));
    console.log(otp);
    if(Number(otpuser.otp) != Number(otp)) throw new apiError(401,"Wrong verification")

    
    const nonVerifieduser = await User.findOne({
        email
    })

    if(!nonVerifieduser) throw new apiError(500,"Users didn't created properly")
    
    nonVerifieduser.isverified = true
    await nonVerifieduser.save()
    await Otp.findByIdAndDelete(otpuser.id)

    return res
    .status(200)
    .json(
        new apiResponse(200,{},"User Verified successfully")
    )
})



const loginUser = asynHandler(async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password) throw new apiError(400,"Credential not found")

    const user = await User.findOne({email})

    if(!user) throw new apiError(400,"User is not register")

    // console.log(user);
    
    const checkPassword = await user.isPasswordCorrect(password)

    if(!checkPassword) throw new apiError(404,"Credential is not correct")

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)
    const options= {
        httpOnly:true,
        secure:true
    }

    const logginUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    
    return res
    .status(200)
    .cookie('accesstoken',accessToken,options)
    .cookie('refreshtoken',refreshToken,options)
    .json(
        new apiResponse(200,{
            logginUser,
            accessToken,
            refreshToken
        })
    )

})

const logedoutUser = asynHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken:undefined
            }
        },{
            new:true
        }
    )
    const options= {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(new apiResponse(200,{},"User Logged Out Successfully"))

})

const refreshBothToken = asynHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) throw new apiError(400,"Unathorized request")

    try {
        const decodedToken =jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN)
        console.log("decoded token = ",decodedToken);
    
        const user = await User.findById(decodedToken?._id).select("-password")
    
        if(!user) throw new apiError(401,"Invalid Token")
    
        if(user?.refreshtoken !== incomingRefreshToken) throw new apiError(400,"Token is not valid")
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {newAccessToken,newRefreshToken} = await generateAccessandRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",newAccessToken,options)
        .cookie("refeshToken",newRefreshToken,options)
        .json(
            new apiResponse(200,{
                accessToken:newAccessToken,
                refreshToken:newRefreshToken
            },
            "Tokens are Regenerated")
        )
    } catch (error) {
        throw new apiError(400,`Couldn't able to refresh tokens ${error}`)
    }
})

const sendOtpToResetPassword= asynHandler(async(req,res)=>{
    const incomingEmail = req.body.email
    const checkEmail = await User.findOne({
        email:incomingEmail
    })

    if(!checkEmail) throw new apiError(400,{success:false})

    const otp = generateRandomNumber()

    const saveOtp = await Otp.create({
        email:incomingEmail,
        otp:otp
    })

    const checkSavedOtp = await Otp.findById(saveOtp?._id)

    if(!checkSavedOtp) throw new apiError(500,"Otp didn't able to send")

    try {
        sendmail(incomingEmail,otp)
    } catch (error) {
        throw new apiError(500,"problem occur in the sending mail",error)
    }

    return res.status(200).json(new apiResponse(200,{
        success:true
    },"Otp sent successfully"))
})

const verityOtpForResetPassword = asynHandler(async(req,res)=>{
    const {email ,otp } = req.body

    const verifyOtp = await Otp.findOne({
        email:email,
        otp:otp
    })

    if(!verifyOtp) throw new apiError(400,"Invalid Verification")

    return res.status(200).json(new apiResponse(
        200,
        {success:true},
        "User Verification Successfull"
    ))
})


const resetPassword = asynHandler(async(req,res)=>{
    
})



export {
    sendOtptoRegister,
    verifyRegister,
    loginUser,
    logedoutUser,
    refreshBothToken,
    resetPassword,
    createUser,
    sendOtpToResetPassword,
    verityOtpForResetPassword
}
