// Re-export types from shared schema
export type {
  JWTPayload,
  AuthTokens,
  AuthResponse,
  RefreshTokenPayload,
  UserPublic,
  UserContext,
  LoginRequest,
  RegisterRequest
} from '@vinxen/shared/schema/auth';

export {
  JWTPayloadSchema,
  AuthTokensSchema,
  AuthResponseSchema,
  RefreshTokenPayloadSchema,
  UserPublicSchema,
  UserContextSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  toPublicUser
} from '@vinxen/shared/schema/auth';