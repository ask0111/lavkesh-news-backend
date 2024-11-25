import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Define the Editor interface for TypeScript
export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  refreshToken: string;
  role: "editor" | "admin" | "user";
  bio?: string; // Editor's bio or description
  permissions: {
    assignedCategories: string[]; 
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
  };
  isActive: boolean; // To track if the editor account is active
  avtaar?: string; // URL to the editor's profile picture
  createdAt: Date;
  updatedAt: Date;
}

// Define the Editor schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["editor", "admin", "user"], // Allowed roles
      default: "user",
    },
    bio: {
      type: String,
      trim: true,
    },
    permissions: {
        assignedCategories: {
          type: [String],
          default: [],
        },
      canCreate: { type: Boolean, default: true },
      canEdit: { type: Boolean, default: true },
      canDelete: { type: Boolean, default: false },
      canApprove: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    avtaar: {
      type: String, // URL to the profile picture
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

export const Users = mongoose.model<IUser>("User", UserSchema);
