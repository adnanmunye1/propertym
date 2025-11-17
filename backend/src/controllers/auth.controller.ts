import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateTokens, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Login user
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(
        res,
        'Email and password are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      logger.warn('Login attempt with invalid email', { email });
      return errorResponse(
        res,
        'Invalid email or password.',
        'INVALID_CREDENTIALS',
        401
      );
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login attempt for inactive user', { email });
      return errorResponse(
        res,
        'Your account has been deactivated. Please contact support.',
        'ACCOUNT_INACTIVE',
        401
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { email });
      return errorResponse(
        res,
        'Invalid email or password.',
        'INVALID_CREDENTIALS',
        401
      );
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    logger.info('User logged in successfully', { userId: user.id, email });

    // Return user data and tokens
    return successResponse(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(
        res,
        'Refresh token is required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return errorResponse(
        res,
        'Invalid or expired refresh token.',
        'INVALID_REFRESH_TOKEN',
        401
      );
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return errorResponse(
        res,
        'User not found or inactive.',
        'USER_NOT_FOUND',
        401
      );
    }

    // Generate new tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    return successResponse(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        'Not authenticated.',
        'NOT_AUTHENTICATED',
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(
        res,
        'User not found.',
        'USER_NOT_FOUND',
        404
      );
    }

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (client-side token removal)
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // In a JWT-based system, logout is primarily handled client-side
    // by removing the token. This endpoint can be used for logging purposes.
    
    if (req.user) {
      logger.info('User logged out', { userId: req.user.userId });
    }

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Create user (admin only - for initial setup)
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return errorResponse(
        res,
        'Email, password, first name, and last name are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse(
        res,
        'A user with this email already exists.',
        'USER_EXISTS',
        409
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'OWNER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info('User created successfully', { userId: user.id, email });

    return successResponse(
      res,
      user,
      'User created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

