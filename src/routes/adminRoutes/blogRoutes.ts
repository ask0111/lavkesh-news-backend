import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePostById,
  deletePostById,
} from "../../controllers/adminControllers/blog.controller";
import { blogPostValidationRules } from "../../middlewares/blogPostValidation.middleware";

const router = express.Router();

router.post("/", blogPostValidationRules, createPost); // Create a post
router.get("/", getAllPosts); // Get all posts
router.get("/:id", getPostById); // Get a single post
router.put("/:id", blogPostValidationRules, updatePostById); // Update a post
router.delete("/:id", deletePostById); // Delete a post

export default router;
