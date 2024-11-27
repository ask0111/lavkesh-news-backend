import { Schema, model, Document, ObjectId } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  subTitle: string;
  image: string;
  content: string;
  categories: string;
  url: string;
  tags: string[];
  meta: {
    title: string;
    description: string;
  };
  headline: boolean;
  slug: string;
  excerpt: string;
  author: ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    subTitle: {
      type: String,
      required: [true, "Sub-title is required"],
      maxlength: [150, "Sub-title cannot exceed 150 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      match: [
        /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg)$/i,
        "Must be a valid image URL",
      ],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    categories: {
      type: String,
      required: [true, "Category is required"],
    },
    url: {
      type: String,
      unique: true,
      required: [true, "URL is required"],
      // match: [
      //   /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
      //   "Must be a valid URL",
      // ],
    },
    tags: {
      type: [String],
      default: [],
    },
    meta: {
      title: {
        type: String,
        required: [true, "Meta title is required"],
      },
      description: {
        type: String,
        required: [true, "Meta description is required"],
      },
    },
    headline: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export const BlogPost = model<IBlogPost>("BlogPost", BlogPostSchema);
