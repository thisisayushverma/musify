import { Router } from "express";
import { registerUser } from "../controllers/user.controllters.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route('/register').post(
    upload.single('avatarImage'),
    registerUser
    )



export default router