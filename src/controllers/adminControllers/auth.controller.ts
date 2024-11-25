import { Request, Response } from "express";
import nodemailer from "nodemailer";
import {
  errorResponse,
  StatusCode,
  successResponse,
} from "../../utils/responseHandler";
import { Users } from "../../models/users.model";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import {
  generateAccessAndRefereshTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../helpers/auth.helper.function";

require("dotenv").config();

interface IOTP {
  [key: string]: string;
}
const otpStore: IOTP = {};
const verifiedOTPStore: IOTP = {};

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADMIN,
    pass: process.env.EMAIL_PASS,
  },
});
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sendOtpByEmail = async (req: Request, res: Response) => {
  const {name, email } = req.body;
  if (!name || !email) {
    errorResponse(res, "Name or Email are required", {}, StatusCode.BAD_REQUEST);
    return;
  }

  const otp = generateOtp();
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_ADMIN,
    to: email,
    subject: "Your OTP for World Blog Login",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #007bff;">Your OTP for World Blog Login</h2>
              <p>Hi <strong>${name}</strong>,</p>
              <p>Thank you for using World Blog! To proceed with your login or account verification, please use the One-Time Password (OTP) below:</p>
              <div style="text-align: center; margin: 20px 0;">
                  <span style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px 20px; border: 1px solid #007bff; border-radius: 8px;">123456</span>
              </div>
              <p>This OTP is valid for the next <strong>10 minutes</strong>. If you did not request this, please ignore this email or contact our support team immediately.</p>
              <p style="margin-top: 20px;">Best regards,</p>
              <p>The World Blog Team</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; text-align: center; color: #555;">Need help? Contact us at <a href="mailto:support@worldblog.com" style="color: #007bff; text-decoration: none;">support@worldblog.com</a></p>
          </div>
      </body>
      </html>
    `,
  };
  
  try {
    const isUser = await Users.find({email});
    if(isUser && isUser.length>0){
      errorResponse(res, 'User already exists with this email.', 'User already exists with this email.', StatusCode.BAD_REQUEST)
    return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    successResponse(res, "OTP sent successfully", "", StatusCode.OK);

    // Automatically remove OTP after 5 minutes
    setTimeout(() => {
      delete otpStore[email];
      console.log(`OTP expired for ${email}`);
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error("Error sending OTP:", error);
    errorResponse(
      res,
      "Failed to send OTP",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const verifyOtpByEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    errorResponse(
      res,
      "Email and OTP are required",
      "",
      StatusCode.BAD_REQUEST
    );
    return;
  }

  try {
    if (otpStore[email] === otp) {
      verifiedOTPStore[email] = otpStore[email];
      delete otpStore[email];
      successResponse(
        res,
        "OTP verified successfully",
        "OTP verified successfully",
        StatusCode.OK
      );

      return;
      // const user: any = await Users.find({email});
      // console.log(user);
      // if(!user && user.length < 0){
      //     const user = new Users({email});
      //     await user.save();
      //     successResponse(
      //         res,
      //         "OTP verified successfully",
      //         "OTP verified successfully",
      //         StatusCode.OK
      //     );
      // }else{
      //     errorResponse(res, "Email already exist!", "Email already exist!", StatusCode.BAD_REQUEST);
      // }
    } else {
      errorResponse(
        res,
        "Invalid OTP",
        "Invalid or expired OTP",
        StatusCode.BAD_REQUEST
      );
    }
  } catch (error) {
    errorResponse(
      res,
      "Enternal sever error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};
console.log(verifiedOTPStore)
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password, otp } = req.body;
  if (!verifiedOTPStore[email] && verifiedOTPStore[email] === otp) {
    errorResponse(
      res,
      "Before sign-up Verify email!",
      "Before sign-up Verify email!",
      StatusCode.BAD_REQUEST
    );
    return;
  }

  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      errorResponse(
        res,
        "User already exists with this email.",
        "User already exists with this email.",
        StatusCode.CONFLICT
      );
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    successResponse(
      res,
      "User created successfully.",
      { redirect: "/login" },
      StatusCode.CREATED
    );
  } catch (error) {
    errorResponse(
      res,
      "Enternal sever error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      errorResponse(
        res,
        "Invalid email or password.",
        "Invalid email or password.",
        StatusCode.NOT_FOUND
      );
      return;
    }
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  errorResponse(
    res,
    "Invalid email or password.",
    "Invalid email or password.",
    StatusCode.BAD_REQUEST
  );
  return;
}

const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
  user
);
    successResponse(
      res,
      "Login successful",
      { accessToken, refreshToken, redirect: "/" },
      StatusCode.OK
    );
  } catch (error) {
    errorResponse(
      res,
      "Enternal server error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const refreshAccessTokenHandler = async (req: Request, res: Response) =>{
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    errorResponse(
      res,
      "Unauthorized request",
      "Unauthorized request",
      StatusCode.UNAUTHORIZED
    );
    return;
  }

  try {
    const decodedToken = verifyToken(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await Users.findById(decodedToken?._id);

    if (!user) {
      errorResponse(
        res,
        "Invalid refresh token",
        "Invalid refresh token",
        StatusCode.UNAUTHORIZED
      );
      return;
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      errorResponse(
        res,
        "Refresh token is expired or used",
        "Refresh token is expired or used",
        StatusCode.UNAUTHORIZED
      );
      return
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user
    );

    successResponse(
      res,
      "Access token refreshed",
      { accessToken, refreshToken, redirect: "/" },
      StatusCode.OK
    );
  } catch (error) {
    errorResponse(
      res,
      "Enternal server error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};
