import express from "express";
const router = express.Router();

// Import the routes
import blogRoute from './adminRoutes/blogRoutes';
import s3Route from './adminRoutes/s3Routes';
import authRoute from './adminRoutes/authRoutes'
// Mount the routes with a path prefix
router.use('/auth', authRoute)
router.use('/blogs', blogRoute);
router.use('/s3', s3Route);

export default router; // Export the router
