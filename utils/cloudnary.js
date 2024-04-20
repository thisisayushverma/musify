import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API, 
    api_secret: process.env.CLOUDINARY_SECRET
  });

const uploadoncloudinary = async (localPath)=>{
    try {
        if(!localPath) return null
        const fileupload = await cloudinary.uploader.upload(localPath,{
            resource_type: "auto"
        })

        console.log("file upload successfully ",fileupload.url);
        fs.unlinkSync(localPath)
        return fileupload
    } catch (error) {
        fs.unlink(localPath)
        console.log("file couldn't upload on cloudinary");
    }
}

export {uploadoncloudinary}