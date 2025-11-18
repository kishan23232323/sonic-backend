"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const core_middleware_1 = require("./api/middleware/core.middleware");
const error_middleware_1 = require("./api/middleware/error.middleware");
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(core_middleware_1.corsMiddleware);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes will be added here
// Error handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map