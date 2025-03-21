import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users } from "../model/userModel";
import dotenv from 'dotenv';
import { Otp } from "../model/otp"; 
import sendVerifyMail from "../utils/sendVerifyMail"; 
import asyncHandler from 'express-async-handler';
import { Todo } from "../model/taskModel";
dotenv.config();


const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: "3d" });
};


export const registerUser = async (req: Request, res: Response): Promise<void> => {
  console.log("Registration Request Received:", req.body);

  try {
    const { userName, email, password } = req.body;

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      console.log("User already exists:", email);
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Users.create({
      userName,
      email,
      password: hashedPassword,
      isVerified: false, 
    });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated OTP:", otp);

    await Otp.create({ email, otp });

    await sendVerifyMail(req, userName, email);

    console.log("User registered successfully:", email);
    res.status(201).json({ message: "Please confirm your OTP", email });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "User registration failed" });
  }
};



export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "User is not verified. Please verify your email first." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());

    res.cookie("accessToken", accessToken, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge:     3 * 24 * 60 * 60 * 1000


    });
    
        const todos = await Todo.find({ user: user });
    

    res.json({
      message: "User logged in successfully",
      user: {
        id: user._id.toString(),
        name: user.userName,
        email: user.email,
        accessToken:accessToken,
        todos:todos
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Login failed" });
  }
};


export const verifyOTP = asyncHandler(async (req: Request, res: Response,) => {
  try {
    const { email, otp } = req.body;

    console.log("Received Request Body:", req.body);

    if (!email || !otp) {
      console.log("Error: Email and OTP are required");
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      console.log("Error: No OTP found for this email");
      res.status(400).json({ message: "OTP expired or not found" });
      return;
    }

    console.log(`Stored OTP: ${otpRecord.otp} | Received OTP: ${otp}`);

    if (otpRecord.otp.trim() !== otp.toString().trim()) {
      console.log("Error: Invalid OTP");
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    const otpGeneratedTime = otpRecord.createdAt.getTime();
    const currentTime = Date.now();
    const expiryTime = 2 * 60 * 1000; 

    if (currentTime - otpGeneratedTime > expiryTime) {
      console.log("Error: OTP expired");
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    const user = await Users.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      console.log("Error: User not found");
      res.status(400).json({ message: "User not found" });
      return;
    }

    await Otp.deleteOne({ email });

    console.log("Success: OTP verified, user is now verified");
    res.status(200).json({ message: "OTP verified successfully, user is now verified", user });
  } catch (error) {
    res.status(500).json(`${error}`) 
  }
});


export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log("Received Resend OTP Request for:", email);

    if (!email) {
      console.log("Error: Email is required");
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await Users.findOne({ email });

    if (!user) {
      console.log("Error: User not found");
      res.status(404).json({ message: "User not found" });
      return;
    }

    await Otp.deleteMany({ email });

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const otpRecord = new Otp({ email, otp: newOtp, createdAt: new Date() });
    await otpRecord.save();

    console.log(`New OTP generated for ${email}: ${newOtp}`);

    await sendVerifyMail(email, "Your OTP Code", `Your OTP is: ${newOtp}`);

    res.status(200).json({ message: "OTP has been resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});


export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;
  res.json({ message: "Logged out successfully" });
};
