import ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs"
import { error } from "console";

ffmpeg.setFfmpegPath(ffmpegPath);

function transwav(inputfile , outputDir){
    return new Promise(function(resolve,reject){
        const inputAudioPath = inputfile.path;
        // console.log(inputAudioPath);
        // console.log(outputDir);
        const outputSubDir = path.join(outputDir,`${inputfile.filename}`)
        console.log("output dir:-",outputSubDir);
        console.log(inputAudioPath);
        // console.log(fs.existsSync(outputSubDir));
        // console.log(fs.existsSync(inputAudioPath));
        ffmpeg(inputAudioPath)
        .output(outputSubDir)
        .toFormat('wav')
        .on('start',()=>{
            console.log("conversion to wav is start");
        })
        .on('end',()=>{
            
            console.log(fs.existsSync(`./public/wavfile/${inputfile.filename}`));
            // console.log(inputfile.filename);
            // const inputAud=fs.readFileSync(`./public/wavfile/${inputfile.filename}`);
            // console.log(inputAud);
            console.log("conversion is complete");
            resolve()
            // const tempfile = fs.readdirSync(`./wavaudio/`)
            // console.log(tempfile);
        })
        .on('error',(error)=>{
            console.log("Error is:-",error);
        })
        .run()
        
    })
}

export {transwav};
