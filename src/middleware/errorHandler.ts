import { Request, Response, NextFunction } from 'express';
import { CustomError, ApiResponse } from '../types/index.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found middleware
 */
export const notFound = (
  req: Request,
  _res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
