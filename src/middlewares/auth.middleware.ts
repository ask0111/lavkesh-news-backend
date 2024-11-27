import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/auth.helper.function";
import { Users } from "../models/users.model";
import {
  errorResponse,
  StatusCode,
  successResponse,
} from "../utils/responseHandler";

export const resetTokenValidate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;

  try {
    const decoded: any = await verifyToken(
      token as string,
      process.env.JWT_RESET_SECRET
    );
    
    const user = await Users.findOne({
      email: decoded.email,
      resetToken: token,
    });
    if (!user) {
      errorResponse(
        res,
        "Invalid or expired token",
        "Invalid or expired token",
        StatusCode.BAD_REQUEST
      );
      return;
    }
    req.user = user || null;
    next();
  } catch (error) {
    errorResponse(
      res,
      "Invalid or expired token",
      error,
      StatusCode.BAD_REQUEST
    );
  }
};


