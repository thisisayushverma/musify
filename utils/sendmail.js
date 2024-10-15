import nodemailer from "nodemailer"
import { Otp } from "../models/otp.models.js";
const transporter = nodemailer.createTransport({
    service:"Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user:process.env.EMAIL_ID,
        pass:process.env.PASSWORD_EMAIL,
    },
});


export const sendmail = async(email,otp)=>{

    const message={
        from:"musify-vefication@gmail.com",
        to:email,
        subject:"Otp Verififcation Mail",
        text:"Verfication OTP",
        html:`<b>${otp}<b/>`
    }

    transporter.sendMail(message,(error,info)=>{
        if(error) console.log(error,"Error occured while sending mail");
        else console.log(info,"mail send");
    })
    


    const checkUser = await Otp.findOne({email:email})

    if(checkUser){
        await Otp.findByIdAndUpdate(checkUser._id,{ $set:{otp:otp}})
        console.log("otp updated");
    }
    else{
        await Otp.create({
            email:email,
            otp:otp
        })
        console.log("otp added");
    }
}

