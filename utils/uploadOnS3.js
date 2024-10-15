import { GetObjectCommand, S3Client ,PutObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3"
import fs from "fs"


const s3Clinet = new S3Client({
    region: 'ap-south-1',
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY
    }
})

const uploadAudioFolderToS3 = async(fileName,fileBitrate,filePath)=>{
    console.log("uploading audio file ",fileName,"with",fileBitrate);
    const insideFile = fs.readdirSync(filePath)
    // console.log(typeof(insideFile));
    insideFile.forEach(fl=>{
        (async ()=>{
            try {
                // console.log(typeof(fl));
                // console.log(fl);
                await s3Clinet.send(new PutObjectCommand({
                    Bucket: process.env.AWS_AUDIO_BUCKET,
                    Key:`${fileName}/output_${fileBitrate}/${fl}`,
                    Body:fs.readFileSync(`${filePath}/${fl}`)
                }))
            } catch (error) {
                console.log("error:-",error);
            }
        })();
    })
}

const uploadImageToS3 = async(fileName)=>{
    console.log("Uploading the thumbnail to s3");
    (async ()=>{
        try {
            // console.log(typeof(fl));
            // console.log(fl);
            await s3Clinet.send(new PutObjectCommand({
                Bucket: process.env.AWS_IMAGE_BUCKET,
                Key:`${fileName}`,
                Body:fs.readFileSync(`./public/temp/${fileName}`)
            }))
        } catch (error) {
            console.log("error:-",error);
        }
    })();
}


const deleteImageFromS3 = async(fileName)=>{
    console.log("Deleting the image from S3 Bucket");
    (async ()=>{
        try {
            await s3Clinet.send(new DeleteObjectCommand({
                Bucket:process.env.AWS_IMAGE_BUCKET,
                Key : `${fileName}`
            }))
        } catch (error) {
            console.log("Error while deleting image form s3 bucket",error)
        }
    })();
}

const deleteAudioFolderFromS3 = async(fileNode)=>{
    console.log("Deleting audio folder from s3 Bucket");
    (async ()=>{
        try {
            const listParams = {
                Bucket:process.env.AWS_AUDIO_BUCKET,
                Prefix:`${fileNode}/`
            }
            const listedObj = await s3Clinet.send(new ListObjectsV2Command(listParams))
            // console.log(listedObj.Contents);
            const deleteLists = {
                Bucket: process.env.AWS_AUDIO_BUCKET,
                Delete: { Objects : [] }
            }

            listedObj.Contents.forEach(({ Key })=>{
                // console.log(Key);
                deleteLists.Delete.Objects.push({ Key })
            })

            console.log(deleteLists.Delete.Objects);

            await s3Clinet.send(new DeleteObjectsCommand(deleteLists))
            console.log("Deletion is Completed");
        } catch (error) {
            console.log("Error occured",error);
        }
    })();
}

export{
    uploadAudioFolderToS3,
    uploadImageToS3,
    deleteImageFromS3,
    deleteAudioFolderFromS3
}