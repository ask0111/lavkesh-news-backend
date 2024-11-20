import { Response } from 'express';

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface ApiResponse {
  status: boolean;
  message: string;
  data?: any;
  error?: any;
}

const sendResponse = (
  res: Response,
  message: string,
  status: boolean,
  statusCode: StatusCode,
  payload?: any
) => {
  const response: ApiResponse = {
    status,
    message,
    ...(status ? { data: payload } : { error: payload }),
  };
  return res.status(statusCode).json(response);
};

// Exported Functions for Success and Error
export const successResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: StatusCode = StatusCode.OK
) => {
  return sendResponse(res, message, true, statusCode, data);
};

export const errorResponse = (
  res: Response,
  message: string,
  error: any = null,
  statusCode: StatusCode = StatusCode.BAD_REQUEST
) => {
  return sendResponse(res, message, false, statusCode, error);
};
