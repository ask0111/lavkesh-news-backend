import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
require("dotenv").config();

export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});


/**
 * Generate pre-signed URL for S3 upload.
 * @param bucketName The S3 bucket name.
 * @param folderPath The folder where the file will be uploaded.
 * @param fileName The name of the file to be uploaded.
 * @param fileType The file's MIME type.
 */
export const generatePresignedUrl = async (
  bucketName: string,
  folderPath: string,
  fileName: string,
  fileType: string
): Promise<{ presignedUrl: string; s3Url: string }> => {
  try {
    const key = `${folderPath}/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });
    
    // Generate pre-signed URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
    const s3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    
    // console.log(presignedUrl, s3Url);
    return { presignedUrl, s3Url };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error("Failed to generate pre-signed URL.");
  }
};

/**
 * Generate pre-signed URL for S3 upload.
 * @param bucketName The S3 bucket name.
 * @param folderPath The folder where the file will be uploaded.
 * @param fileName The name of the file to be uploaded.
 */
export const deleteS3file = async(bucketName: string, folderPath: string, fileName:string)=>{
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: `${folderPath}/${fileName}`,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    throw new Error('File not deleted!');
  }
}

