import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/error.util';
import logger from '../../utils/logger.util';


export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};