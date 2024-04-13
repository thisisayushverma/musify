import conn from "./db/conn.js";
import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})




conn()
.then(()=>{
    app.on("error",(err)=>{
        throw err
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server is running on port:-",process.env.PORT);
    })
})
.catch((error)=>{
    console.log(`Error occur while connecting db ${error}`);
})