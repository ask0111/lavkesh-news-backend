"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/get-news', (req, res) => {
    console.log("Get News");
    res.status(200).json({ message: 'Geted!' });
});
exports.default = router;
