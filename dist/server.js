"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_handler_1 = __importDefault(require("./_middleware/error-handler"));
const accounts_controller_1 = __importDefault(require("./accounts/accounts.controller"));
const swagger_1 = __importDefault(require("./_helpers/swagger"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
// CORS Configuration - Fixed
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    credentials: true
}));
// Routes
app.use('/accounts', accounts_controller_1.default);
app.use('/api-docs', swagger_1.default);
// Global error handler - must be last
app.use(error_handler_1.default);
// Port configuration
const port = process.env.PORT || 4000;
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
