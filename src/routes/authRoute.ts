        import express from "express";
        import { registerUser, loginUser, logoutUser,verifyOTP,resendOtp,verifyMail,resetPass} from "../controller/authController";


        const router = express.Router();


        router.post("/register", registerUser);
        router.post("/login", loginUser);
        router.post("/logout", logoutUser);
        router.post('/verifyOTP',verifyOTP)
        router.post('/resendOtp',resendOtp)
        router.post('/verifyMail',verifyMail)
        router.post('/resetPass',resetPass)

        export default router;
