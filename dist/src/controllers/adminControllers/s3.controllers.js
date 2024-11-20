"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3UrlGeneratorGet = exports.uploadToS3UrlGenerator = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const uploadToS3UrlGenerator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName, fileType, folder } = req.body;
        if (!fileName || !fileType) {
            res.status(400).json({ message: "fileName and fileType are required." });
            return;
        }
        const bucketName = process.env.AWS_BUCKET_NAME;
        const key = folder ? `${folder}/${fileName}` : fileName;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: fileType,
        });
        // Generate a pre-signed URL using getSignedUrl
        // const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        res.status(200).json({
            // uploadUrl: signedUrl,
            fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        });
    }
    catch (error) {
        console.error("Error generating pre-signed URL:", error);
        res.status(500).json({ message: "Could not generate pre-signed URL", error });
    }
});
exports.uploadToS3UrlGenerator = uploadToS3UrlGenerator;
const uploadToS3UrlGeneratorGet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(500).json({ message: "Could not generate pre-signed URL" });
});
exports.uploadToS3UrlGeneratorGet = uploadToS3UrlGeneratorGet;
