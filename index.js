import conn from "./db/conn.js";
import dotenv from "dotenv"

dotenv.config({
    path:'./env'
})




conn()