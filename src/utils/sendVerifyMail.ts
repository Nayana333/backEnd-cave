import nodemailer from "nodemailer";
import { Request } from "express";
import { Otp } from "../model/otp"; 

const sendVerifyMail = async (req: Request, name: string, email: string) => {
  try {
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new Error("No OTP found for this email.");
    }

    const otp = otpRecord.otp; 

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "For verification purpose",
      html: `<html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
          }
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .otp {
            background-color: #f8f8f8;
            padding: 10px 20px;
            border-radius: 4px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
          }
          .cta-button {
            display: block;
            width: fit-content;
            margin: 0 auto;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verification</h1>
          <p>Hello ${name},</p>
          <p>Please enter this OTP to verify your email:</p>
          <div class="otp">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
          <a href="#" class="cta-button">Verify Email</a>
        </div>
      </body>
      </html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email has been sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendVerifyMail;
