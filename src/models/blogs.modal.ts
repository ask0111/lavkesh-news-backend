import { Schema, model, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categories: string[]; // Array of ObjectIds referencing categories
  tags: string[];
  author: any; // ObjectId referencing User
  status: "draft" | "published";
  coverImage?: string;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    coverImage: {
      type: String,
    },
    meta: {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export const BlogPost = model<IBlogPost>("BlogPost", BlogPostSchema);
