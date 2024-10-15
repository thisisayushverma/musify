import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs"



ffmpeg.setFfmpegPath(ffmpegPath);

function transcode(inputfile , outputDir, bitrate){
    return new Promise(function(resolve,reject){
        console.log("cosversion to hls is start ");
        console.log(typeof(inputfile),typeof(outputDir));
        // const inputAud=fs.readFileSync(`wavaudio/${inputfile}`);
        // console.log(inputAud);
        
        // const inputAudioPath = inputfile.path;
        // console.log(outputDir);
        const outputSubDir = `${outputDir}/output_${bitrate}`
        if(!fs.existsSync(outputSubDir)){
            fs.mkdirSync(outputSubDir)
        }
        // console.log(fs.existsSync(outputSubDir));
        console.log(inputfile);

        ffmpeg(inputfile)
        .audioCodec('aac')
        .format('hls')
        .audioBitrate(bitrate)
        .addOption("-hls_time",10)
        .addOption("-hls_list_size", 0)
        .addOption("-max_muxing_queue_size", 1024)
        .addOption("-hls_segment_filename",`${path.join(outputSubDir,'segment_%03d.ts')}`)
        .output(path.join(outputSubDir,'index.m3u8'))
        .on('start',()=>{
            console.log("hls conversion start");
        })
        .on('end',()=>{
            console.log("hls conversion is done");
            resolve()
        })
        .on('error',(error)=>{
            console.log("Error while transcodind",error);
        })
        .run()
    })
    
}

export {transcode};
