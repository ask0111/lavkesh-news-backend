import { check } from "express-validator";

export const blogPostValidationRules = [
  // Title
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  // Subtitle
  check("subTitle")
    .notEmpty()
    .withMessage("Sub title is required")
    .isLength({ max: 150 })
    .withMessage("Sub title cannot exceed 150 characters"),

  // Image URL
  check("image")
    .notEmpty()
    .withMessage("Image URL is required")
    .matches(/^https?:\/\/.+\.(jpg|jpeg|png|webp|svg)$/i)
    .withMessage("Must be a valid image URL"),

  // Content
  check("content")
    .notEmpty()
    .withMessage("Content is required"),

  // Categories
  check("categories")
    .notEmpty()
    .withMessage("Category is required"),

  // Tags
  check("tags")
    .isArray()
    .withMessage("Tags must be an array of strings")
    .optional(),

  // Slug
  check("slug")
    .notEmpty()
    .withMessage("Slug is required")
    .isSlug()
    .withMessage("Slug must be in a valid format"),

  // URL
  // check("url")
  //   .notEmpty()
  //   .withMessage("URL is required")
  //   .isURL()
  //   .withMessage("Must be a valid URL")
  //   .optional(),

  // Meta Title
  check("meta.title")
    .notEmpty()
    .withMessage("Meta title is required"),

  // Meta Description
  check("meta.description")
    .notEmpty()
    .withMessage("Meta description is required"),

  // Excerpt
  check("excerpt")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Excerpt cannot exceed 250 characters"),

  // Author
  check("author")
    .notEmpty()
    .withMessage("Author is required"),

  // Headline (boolean)
  check("headline")
    .isBoolean()
    .withMessage("Headline must be a boolean value")
    .optional(),

  // Status
  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be 'draft', 'published', or 'archived'"),

];

