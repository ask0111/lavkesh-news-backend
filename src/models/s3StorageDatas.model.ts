import mongoose, { Schema, Document } from 'mongoose';

export interface IS3StorageData extends Document {
  fileType: 'image' | 'video' | 'audio';
  fileName: string;
  fileUrl: string;
  bucketName: string;
  folderPath?: string; 
  sizeInBytes: number; 
  metadata?: Record<string, string>;
}

const S3StorageDataSchema: Schema = new Schema(
  {
    fileType: {
      type: String,
      required: true,
      enum: ['image', 'video', 'audio'],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    bucketName: {
      type: String,
      required: true,
    },
    folderPath: {
      type: String,
    },
    sizeInBytes: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Create the model
const S3StorageData = mongoose.model<IS3StorageData>('S3StorageData', S3StorageDataSchema);

export default S3StorageData;
