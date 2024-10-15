import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {uploadAudioFile} from "../controllers/audio.controllers.js"


const router = Router()

router.use(verifyJWT)

router.route('/upload')
.post(upload.fields([
    {
        name:"audiofile",
        maxCount:1
    },{
        name:"audiopicture",
        maxCount:1
    }
]),uploadAudioFile)


export default router