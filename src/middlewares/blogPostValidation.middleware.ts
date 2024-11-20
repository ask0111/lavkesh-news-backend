import { check } from "express-validator";

export const blogPostValidationRules = [
  check("title").notEmpty().withMessage("Title is required").isLength({ max: 150 }).withMessage("Title cannot exceed 150 characters"),
  check("slug").notEmpty().withMessage("Slug is required").isSlug().withMessage("Slug must be a valid format"),
  check("content").notEmpty().withMessage("Content is required"),
  check("meta.title").notEmpty().withMessage("Meta title is required"),
  check("meta.description").notEmpty().withMessage("Meta description is required"),
];
