import { Response } from 'express';

/**
 * Send a success response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param data Response data
 */
export const successResponse = (res: Response, statusCode: number, data: any): Response => {
  return res.status(statusCode).json({
    status: 'success',
    data
  });
};

/**
 * Send an error response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Error message
 * @param error Optional error details
 */
export const errorResponse = (res: Response, statusCode: number, message: string, error?: any): Response => {
  return res.status(statusCode).json({
    status: 'error',
    error: {
      code: statusCode,
      message,
      details: error
    }
  });
};
