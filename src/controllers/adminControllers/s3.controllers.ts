import { Request, Response } from "express";
import dotenv from "dotenv";
import {
  errorResponse,
  StatusCode,
  successResponse,
} from "../../utils/responseHandler";
import { validateRequiredFields } from "../../common/Validation.funs/s3upload.validation";
import { deleteS3file, generatePresignedUrl } from "../../helpers/s3.helper.function";
import S3StorageData from "../../models/s3StorageDatas.model";

dotenv.config();

export const generatePresignedUploadS3Url = async (
  req: Request,
  res: Response
) => {
  const { folderPath, fileName, fileType, sizeInBytes, metadata } = req.body;
  const { isValid, message } = validateRequiredFields({
    folderPath,
    fileName,
    fileType,
    sizeInBytes,
    metadata,
  });
  if (!isValid) {
    errorResponse(res, message, {}, StatusCode.BAD_REQUEST);
    return;
  }

  try {
    const bucketName = process.env.AWS_BUCKET_NAME as string;
    const { presignedUrl, s3Url } = await generatePresignedUrl(
      bucketName,
      folderPath,
      fileName,
      fileType
    );
    const fileDetails = new S3StorageData({
      fileType: fileType.trim().split("/")[0],
      fileName,
      fileUrl: s3Url,
      bucketName,
      folderPath,
      sizeInBytes,
      metadata,
    });
    const fileData = await fileDetails.save();
    const data = { presignedUrl, fileData };

    successResponse(res, "Data fetched successfully", data, StatusCode.OK);
  } catch (error) {
    console.error("Error:", error);
    errorResponse(
      res,
      "Failed to generate pre-signed URL.",
      {},
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const getByTypeToS3Url = async (req: Request, res: Response) => {
  const { fileType, search } = req.query;

  if (!fileType) {
    errorResponse(res, "File type is required.", {}, StatusCode.BAD_REQUEST);
    return;
  }
  let query: any = { fileType }; 
  if (search) {
    query.fileName = { $regex: search, $options: "i" };
  }

  try {
    const data = await S3StorageData.find(query).sort({ updatedAt: -1 }).exec();

    if (!data || data.length === 0) {
      errorResponse(
        res,
        "No data found for the given file type.",
        {},
        StatusCode.NOT_FOUND
      );
      return;
    }

    successResponse(res, "", data, StatusCode.OK);
  } catch (error) {
    console.error("Error fetching data by file type:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

export const deleteFileFromS3 = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  if (!fileId) {
    errorResponse(res, "File ID is required.", {}, StatusCode.BAD_REQUEST);
    return;
  }

  try {
    const fileDetails = await S3StorageData.findById(fileId);
    if (!fileDetails) {
      errorResponse(
        res,
        "File not found in database.",
        {},
        StatusCode.NOT_FOUND
      );
      return;
    }

    const { bucketName, folderPath="", fileName } = fileDetails;
    await deleteS3file(bucketName, folderPath, fileName );
    
    const data = await S3StorageData.findByIdAndDelete(fileId);
    successResponse(res, "File deleted successfully.", data, StatusCode.OK);
    return;
  } catch (error) {
    console.error("Error deleting file:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};
