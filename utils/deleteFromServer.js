import { error } from "console";
import fs from "fs"
import path  from "path"



const deleteFromServer = async(fileName,filePath) =>{
    
    fs.stat(`${filePath}/${fileName}`,(err,stat)=>{
        if(err){
            console.log("Error occuring while deleting file from server but this error is occured",err);
            return false;
        }
        if(stat.isFile()){
            // if that is a file
            try {
                fs.unlinkSync(`${filePath}/${fileName}`);
                console.log(`${filePath}/${fileName} was deleted synchronously.`);
            } catch (err) {
                console.error(`Error deleting ${filePath}/${fileName} synchronously:`, err);
                return false;
            }
        }
        else if(stat.isDirectory()){
            //  if that is an folder
            try {
                fs.rmSync(`${filePath}/${fileName}`, { recursive: true });
                console.log(`Directory ${filePath}/${fileName} was deleted synchronously.`);
            } catch (err) {
                console.error(`Error deleting directory ${filePath}/${fileName} synchronously:`, err);
                return false;
            }

        }
    })

    return true;

}

export{
    deleteFromServer
}