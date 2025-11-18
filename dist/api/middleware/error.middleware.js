"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const error_util_1 = require("../../../utils/error.util");
const logger_util_1 = __importDefault(require("../../../utils/logger.util"));
const errorHandler = (err, req, res, next) => {
    if (err instanceof error_util_1.AppError) {
        logger_util_1.default.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }
    logger_util_1.default.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger_util_1.default.error(err.stack);
    return res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map