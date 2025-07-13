import { z } from 'zod';
import type { User } from '@prisma/client';

// Base user schema (excluding sensitive fields)
export const UserPublicSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
});

// Auth request schemas
export const LoginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(1, 'Name is required'),
});

// JWT payload schemas
export const JWTPayloadSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  type: z.enum(['access', 'refresh']),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export const RefreshTokenPayloadSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  type: z.literal('refresh'),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Auth response schemas
export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const AuthResponseSchema = z.object({
  user: UserPublicSchema,
  tokens: AuthTokensSchema,
});

// User context schema (for middleware)
export const UserContextSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

export const RefreshResponseSchema = z.object({
  accessToken: z.string().min(10),
  expiresIn: z.number().positive(),
});

// Type exports
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserContext = z.infer<typeof UserContextSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// Utility function to transform Prisma User to public user
export const toPublicUser = (user: User): UserPublic => ({
  id: user.id,
  email: user.email,
  name: user.name,
});