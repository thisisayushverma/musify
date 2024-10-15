import { Router } from "express";
import { createUser, logedoutUser, loginUser, refreshBothToken, resetPassword,sendOtptoRegister,sendOtpToResetPassword, verifyRegister, verityOtpForResetPassword } from "../controllers/user.controllters.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const  router = Router()

router.route('/send-otp-to-register').post(sendOtptoRegister)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logedoutUser)

router.route('/refreshtoken').post(refreshBothToken)

router.route('/verify-register').post(verifyRegister)

router.route('/reset-password').post(resetPassword)

router.route('/create-user').post(createUser)

router.route('/send-otp-to-reset-password').post(sendOtpToResetPassword)

router.route('/verify-otp-for-reset-password').post(verityOtpForResetPassword)




export default router