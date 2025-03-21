import express from "express";
import { registerUser, loginUser, logoutUser,verifyOTP,resendOtp } from "../controller/authController";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);


router.post("/logout", logoutUser);
router.post('/verifyOTP',verifyOTP)
router.post('/resendOtp',resendOtp)
export default router;
