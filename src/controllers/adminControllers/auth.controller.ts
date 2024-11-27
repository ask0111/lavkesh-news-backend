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
  generateToken,
  verifyToken,
} from "../../helpers/auth.helper.function";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { uploadProfile } from "../../routes/adminRoutes/authRoutes";
import multer from "multer";
import path from "path";

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
  const { name, email } = req.body;
  if (!name || !email) {
    errorResponse(
      res,
      "Name or Email are required",
      {},
      StatusCode.BAD_REQUEST
    );
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
    const isUser = await Users.find({ email });
    if (isUser && isUser.length > 0) {
      errorResponse(
        res,
        "User already exists with this email.",
        "User already exists with this email.",
        StatusCode.BAD_REQUEST
      );
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
console.log(verifiedOTPStore);
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

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response
) => {
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
    const decodedToken = await verifyToken(
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
      return;
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

export const sendResetPasswordEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email });

    if (!user) {
      errorResponse(
        res,
        "User not found",
        "User not found",
        StatusCode.NOT_FOUND
      );
      return;
    }

    const resetToken = generateToken(
      { email },
      process.env.JWT_RESET_SECRET!,
      "10m"
    );
    const resetLink = `${process.env.CLIENT_URL}/private/rbac/reset-password?token=${resetToken}`;

    user.resetToken = resetToken;
    // user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_ADMIN,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Click the link below to reset your password. This link is valid for 10 minutes:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    successResponse(
      res,
      "Reset password link sent to email",
      "Reset password link sent to email",
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

export const verifyResetToken = async (req:Request, res:Response)=>{
  successResponse(res, '', null, StatusCode.OK);
}

export const resetPassword = async (req: any, res: Response) => {
  const { newPassword } = req.body;

  try {
    const user = req.user;
    // const user =  null;
    if (!user) {
      errorResponse(
        res,
        "Unauthorized access",
        "User data not found",
        StatusCode.UNAUTHORIZED
      );
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.resetToken = null; 
    // user.resetTokenExpiry = null; // Clear reset token expiry
    await user.save();

    successResponse(
      res,
      "Password reset successful",
      null,
      StatusCode.OK
    );
  } catch (error) {
    errorResponse(
      res,
      "Failed to reset password",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const checkAuthorization = async(req: Request, res: Response)=>{
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    errorResponse(res, "Token is missing", null, StatusCode.UNAUTHORIZED);
    return ;
  }
  
  try {
    const decoded = await verifyToken(token, process.env.JWT_ACCESS_SECRET!);
    const user = await Users.find(decoded._id).select("_id name email avtaar");
    if(!user){
      errorResponse(
        res,
        "Invalid or expired token",
        "Invalid or expired token",
        StatusCode.BAD_REQUEST
      );
      return ;
    }
    successResponse(res, "Authenticated", user[0], StatusCode.OK);
  } catch (error) {
    errorResponse(res, "Invalid token", error, StatusCode.UNAUTHORIZED);
  }
}

export const getUserByProfileId = async(req:Request, res: Response)=>{
  const {profileId} = req.params;
  if(!profileId){
    errorResponse(res, 'user id not found', null, StatusCode.BAD_REQUEST);
    return ;
  }
  try {
    const user = await Users.findById(profileId).select('-password -refreshToken -resetToken');
    successResponse(res, 'Profile get successfully', user, StatusCode.OK);
  } catch (error) {
    errorResponse(
      res,
      "Enternal server error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const updateUserProfile = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  try {
    // Fetch user by ID
    const user = await Users.findById(profileId);
    if (!user) {
       errorResponse(
        res,
        "User ID not found",
        null,
        StatusCode.BAD_REQUEST
      );
      return
    }

    const previousUserProfileUrl = user.avtaar;

    // Configure multer for memory storage
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
       
        const allowedExtensions = [".png", ".PNG", ".jpg", ".jpeg", ".webp"];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(fileExtension)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    }).single("profilePicture");    

    upload(req, res, async (err) => {
      if (err) {
         errorResponse(
          res,
          "Error parsing file",
          err,
          StatusCode.INTERNAL_SERVER_ERROR
        );
        return
      }

      const { updateFields } = req.body;
      let updatedData ={};

      if(updateFields){
         updatedData = JSON.parse(updateFields);
      }
      // Handle the image file upload
      const image = req.file;
      if (image) {

        const filename = `images/avatars/${Date.now()}${path.extname(
          image.originalname
        )}`;
        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filename,
          Body: image.buffer,
          ContentType: image.mimetype,
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        const uploadResult = await s3.send(uploadCommand);

        if (
          !uploadResult.$metadata.httpStatusCode ||
          uploadResult.$metadata.httpStatusCode !== 200
        ) {
          throw new Error("S3 file upload failed");
        }

        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${filename}`;

        updatedData = {
          ...updatedData,
          avtaar: imageUrl,
        }
        // Optional: Delete the previous avatar from S3 if it exists
        if (previousUserProfileUrl) {

          const oldKey = previousUserProfileUrl.split(".com/")[1];
          const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: oldKey,
          };
          await s3.send(new DeleteObjectCommand(deleteParams));
        }
      }

      // Update the user's profile in MongoDB
      const updatedUser = await Users.findByIdAndUpdate(
        profileId,
        { $set: updatedData },
        { new: true } 
      );

      if (!updatedUser) {
         errorResponse(
          res,
          "Failed to update user profile",
          null,
          StatusCode.INTERNAL_SERVER_ERROR
        );
        return;
      }

      successResponse(res, "Profile updated successfully", updatedUser, StatusCode.OK);
    });
  } catch (error) {
    errorResponse(
      res,
      "Internal server error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};
