import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()

app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true
}))
app.use(express.json({
    limit : "16kb"
}))
app.use(express.urlencoded({
    extended:true,
    limit : "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRoutes from "./routes/user.routes.js";
import audioRoutes from "./routes/audio.routes.js"
// routes decleration

app.use('/api/v1/users',userRoutes)
app.use('/api/v1/audio',audioRoutes)

export {app}