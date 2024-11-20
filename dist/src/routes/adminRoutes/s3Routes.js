"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const s3_controllers_1 = require("../../controllers/adminControllers/s3.controllers");
const router = express_1.default.Router();
router.post("/", s3_controllers_1.uploadToS3UrlGenerator);
router.get("/get", s3_controllers_1.uploadToS3UrlGeneratorGet);
exports.default = router;
