import mongoose from "mongoose";
import { DBNAME } from "../constant.js";


const conn = async ()=>{
    try {
        const dbInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`)    
        console.log(`Database connection sucessfull complete ${dbInstance}`);
        // console.log(dbInstance);
        // console.log(dbInstance.connection.host);
    } catch (error) {
        console.log(`Error occuring while connecting DB${error}`);
        process.exit(1)
    }
}

export default conn
