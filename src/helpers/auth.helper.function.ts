import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, Users } from "../models/users.model";
require('dotenv').config()



export const generateAccessToken: (userId: string)=>string = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
};

export const generateRefreshToken: (userId: string)=>string  = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
};

export const verifyToken = (token: string, secret: any) => {
  return jwt.verify(token, secret) as JwtPayload;
};


export const generateAccessAndRefereshTokens = async(user: IUser) =>{
    try {
        const accessToken: string = generateAccessToken(user._id.toString())
        const refreshToken: string = generateRefreshToken(user._id.toString())
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return {accessToken, refreshToken}

    } catch (error) {
        throw new Error("Something went wrong while generating referesh and access token")
    }
}