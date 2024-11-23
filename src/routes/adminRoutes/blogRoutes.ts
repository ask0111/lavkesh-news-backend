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

router.post("/", blogPostValidationRules, createPost); 
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", blogPostValidationRules, updatePostById);
router.delete("/:id", deletePostById); 

export default router;
