import { transcode } from "../utils/wavtoMultiAud.js"
import { apiError } from "../utils/apiError.js"
import { asynHandler } from "../utils/asyncHandler.js"
import { uploadoncloudinary } from "../utils/cloudnary.js"
import { transwav } from "../utils/convertToWav.js"
import fs from "fs"
import { deleteAudioFolderFromS3, deleteImageFromS3, uploadAudioFolderToS3, uploadImageToS3 } from "../utils/uploadOnS3.js"
import apiResponse from "../utils/apiResponse.js"
import { error } from "console"
import { deleteFromServer } from "../utils/deleteFromServer.js"


const uploadAudioFile =  asynHandler(async(req,res)=>{
    const audioFile = req.files?.audiofile
    const audioPicturePath = req.files?.audiopicture

    // console.log(req);

    if(!(audioFile) || !(audioPicturePath)){
        throw new apiError(400,"Audio File's are not Found")
    }
    // console.log(audioPicturePath[0].filename);
    console.log(audioPicturePath);
    const outputDir = `./public/transcodedfile/${audioFile[0].filename}`;
    fs.mkdirSync(outputDir,{recursive:true});
    // console.log(outputDir,fs.existsSync(outputDir));
    let rate = ['64k','128k','256k'];

    (async ()=>{
        const wavfile = await transwav(audioFile[0],"./public/wavfile")
        console.log(fs.existsSync(`./public/wavfile/${audioFile[0].filename}`));
        const wavfildir =`./public/wavfile/${audioFile[0].filename}`
        
        
        await transcode(wavfildir,`./public/transcodedfile/${audioFile[0].filename}`,'64k')
        await transcode(wavfildir,`./public/transcodedfile/${audioFile[0].filename}`,'128k')
        await transcode(wavfildir,`./public/transcodedfile/${audioFile[0].filename}`,'256k')
    })()
    .then(()=>{
        uploadAudioFolderToS3(audioFile[0].filename,rate[0],`./public/transcodedfile/${audioFile[0].filename}/output_${rate[0]}`)
        uploadAudioFolderToS3(audioFile[0].filename,rate[1],`./public/transcodedfile/${audioFile[0].filename}/output_${rate[1]}`)
        uploadAudioFolderToS3(audioFile[0].filename,rate[2],`./public/transcodedfile/${audioFile[0].filename}/output_${rate[2]}`)
    })
    .then(()=>{
        uploadImageToS3(audioPicturePath[0].filename)
    })
    .then(async ()=>{
        const uploadNewAudio = await Audio.create({
            name : req.title,
            thumbnail : `https://s3.ap-south-1.amazonaws.com/imagefile.musify/${audioPicturePath[0].filename}`,
            uniquename : audioFile[0].filename,
            audiourl : `https://s3.ap-south-1.amazonaws.com/audiofile.musify/${audioFile[0].filename}`,
            duration : req.duration,
            isPublished : req.isPublished,
            owner : req.user.fullname
        })

        if((await Audio.findOne({_id : uploadNewAudio._id})) ==NULL){
            return res
            .status(500)
            .json(new apiError(500,"Error while create schema of audio"))
        }

        await deleteFromServer(audioFile[0].filename,"./public/temp")
        await deleteFromServer(audioFile[0].filename,"./public/transcodedfile")
        await deleteFromServer(audioFile[0].filename,"./public/wavfile")
        await deleteFromServer(audioPicturePath[0].filename,"./public/temp")
        
        return res
        .status(200)
        .json(new apiResponse(200,uploadNewAudio,"Audio file uploaded Successfully"))
    })
    .catch(async (error)=>{
        // uploading is their any issue so delete all files from server and aws
        await deleteFromServer(audioFile[0].filename,"./public/temp")
        await deleteFromServer(audioFile[0].filename,"./public/transcodedfile")
        await deleteFromServer(audioFile[0].filename,"./public/wavfile")
        await deleteFromServer(audioPicturePath[0].filename,"./public/temp")
        await deleteAudioFolderFromS3(audioFile[0].filename)
        await deleteImageFromS3(audioPicturePath[0].filename)
        return res
        .status(501)
        .json(new apiError(501,"Audio file is not uploaded",error))
    })

    

    
})



export {
    uploadAudioFile
}