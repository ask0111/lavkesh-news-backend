"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_js_1 = __importDefault(require("./src/routes/index.js"));
const dbConnection_1 = __importDefault(require("./src/config/dbConnection"));
const app = (0, express_1.default)();
const PORT = 5000;
app.use(express_1.default.json());
app.use('/api/v1/news/lv-powered', index_js_1.default);
(0, dbConnection_1.default)();
app.listen(PORT, () => {
    console.log('Server Listning on PORT: ', PORT);
});
