import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  errorResponse,
  StatusCode,
  successResponse,
} from "../../utils/responseHandler";
import { BlogPost } from "../../models/blogs.modal";

// Create a new blog post
export const createPost = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, "", errors.array(), StatusCode.BAD_REQUEST);
    return;
  }

  const {
    title,
    slug,
    content,
    excerpt,
    categories,
    tags,
    author,
    status,
    coverImage,
    meta,
  } = req.body;

  try {
    const newPost = new BlogPost({
      title,
      slug,
      content,
      excerpt,
      categories,
      tags,
      author,
      status,
      coverImage,
      meta,
    });

    const data = await newPost.save();
    successResponse(
      res,
      "Post created successfully!",
      data,
      StatusCode.CREATED
    );
  } catch (error) {
    console.error("Error creating post:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

// Get all blog posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const data = await BlogPost.find().sort({ createdAt: -1 }).exec();
    successResponse(res, "", data, StatusCode.OK);
  } catch (error) {
    console.error("Error fetching posts:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

// Get a single blog post by ID
export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await BlogPost.findById(id).exec();
    if (!data) {
      errorResponse(res, "Post not found", {}, StatusCode.NOT_FOUND);
      return;
    }
    successResponse(res, "", data, StatusCode.OK);
  } catch (error) {
    console.error("Error fetching post:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

// Update a blog post by ID
export const updatePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await BlogPost.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).exec();

    if (!data) {
      errorResponse(res, "Post not found", {}, StatusCode.NOT_FOUND);
      return;
    }
    successResponse(res, "", data, StatusCode.OK);
  } catch (error) {
    console.error("Error updating post:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

// Delete a blog post by ID
export const deletePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await BlogPost.findByIdAndDelete(id).exec();
    if (!data) {
      errorResponse(res, "Post not found", {}, StatusCode.NOT_FOUND);
      return;
    }
    successResponse(res, "Post deleted successfully", data, StatusCode.OK);
  } catch (error) {
    console.error("Error deleting post:", error);
    errorResponse(
      res,
      "Internal Server Error",
      error,
      StatusCode.INTERNAL_SERVER_ERROR
    );
  }
};
