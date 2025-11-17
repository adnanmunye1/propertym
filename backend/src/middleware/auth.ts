import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(
        res,
        'No token provided. Please log in.',
        'NO_TOKEN',
        401
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return errorResponse(
        res,
        'Invalid or expired token. Please log in again.',
        'INVALID_TOKEN',
        401
      );
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(
      res,
      'Authentication failed. Please log in again.',
      'AUTH_FAILED',
      401
    );
  }
};

/**
 * Authorization middleware - checks user role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return errorResponse(
        res,
        'Unauthorized access.',
        'UNAUTHORIZED',
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        'You do not have permission to perform this action.',
        'FORBIDDEN',
        403
      );
    }

    next();
  };
};

