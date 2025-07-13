import argon2 from 'argon2';
import type { JWTPayload, AuthTokens } from '@vinxen/shared/schema/auth';

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    return false;
  }
};

export const generateTokens = async (
  userId: number, 
  email: string, 
  accessJwt: any, 
  refreshJwt: any
): Promise<AuthTokens> => {
  const accessTokenPayload: JWTPayload = {
    id: userId,
    email,
    type: 'access'
  };

  const refreshTokenPayload: JWTPayload = {
    id: userId,
    email,
    type: 'refresh'
  };

  const accessToken = await accessJwt.sign(accessTokenPayload);
  const refreshToken = await refreshJwt.sign(refreshTokenPayload);

  return {
    accessToken,
    refreshToken
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  return { isValid: true };
};