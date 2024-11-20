"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Import the routes
const blogRoutes_1 = __importDefault(require("./adminRoutes/blogRoutes"));
const s3Routes_1 = __importDefault(require("./adminRoutes/s3Routes"));
// Mount the routes with a path prefix
router.use('/blogs', blogRoutes_1.default);
router.use('/s3', s3Routes_1.default);
exports.default = router; // Export the router
