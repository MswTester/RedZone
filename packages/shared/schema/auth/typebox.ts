import { Type, type Static } from '@sinclair/typebox';

// User schemas
export const UserPublicTypeBox = Type.Object({
  id: Type.Number(),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
});

// Auth request schemas
export const LoginRequestTypeBox = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 1 }),
});

export const RegisterRequestTypeBox = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ 
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$' 
  }),
  name: Type.String({ minLength: 1 }),
});

// Auth response schemas
export const AuthTokensTypeBox = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
});

export const AuthResponseTypeBox = Type.Object({
  user: UserPublicTypeBox,
  tokens: AuthTokensTypeBox,
});

// JWT payload schemas
export const JWTPayloadTypeBox = Type.Object({
  id: Type.Number(),
  email: Type.String({ format: 'email' }),
  type: Type.Union([Type.Literal('access'), Type.Literal('refresh')]),
  iat: Type.Optional(Type.Number()),
  exp: Type.Optional(Type.Number()),
});

// Types
export type UserPublicType = Static<typeof UserPublicTypeBox>;
export type LoginRequestType = Static<typeof LoginRequestTypeBox>;
export type RegisterRequestType = Static<typeof RegisterRequestTypeBox>;
export type AuthTokensType = Static<typeof AuthTokensTypeBox>;
export type AuthResponseType = Static<typeof AuthResponseTypeBox>;
export type JWTPayloadType = Static<typeof JWTPayloadTypeBox>;