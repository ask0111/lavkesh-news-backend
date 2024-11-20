import express from "express";
import { deleteFileFromS3, generatePresignedUploadS3Url, getByTypeToS3Url } from "../../controllers/adminControllers/s3.controllers";

const router = express.Router();

router.post("/generate-presigned-url", generatePresignedUploadS3Url);
router.get("/get-s3-urls", getByTypeToS3Url);
router.delete("/delete-s3-url/:fileId", deleteFileFromS3);

export default router;
