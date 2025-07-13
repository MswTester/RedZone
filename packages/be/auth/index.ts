import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import type { PrismaClient } from '@prisma/client';
import { 
  LoginRequestSchema,
  RegisterRequestSchema,
  toPublicUser,
  type AuthResponse,
  type RefreshTokenPayload,
  type UserContext,
} from '@vinxen/shared/schema/auth';
import { 
  LoginRequestTypeBox,
  RegisterRequestTypeBox,
} from '@vinxen/shared/schema/auth/typebox';
import { 
  ApiSuccessResponseGenericTypeBox,
  ApiErrorResponseTypeBox,
  commonErrorsTypebox,
  createSuccessResponse,
} from '@vinxen/shared/schema/ApiResponseTypebox';
import { hashPassword, verifyPassword, generateTokens, validateEmail, validatePassword } from './utils';
import { getAccessTokenExpiryMs, getRefreshTokenExpiryMs, msToSeconds } from './time-utils';
import { 
  requireAuth,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireResourcePermission,
  requireOwnership,
  requirePermissionOrOwnership
} from './middleware';

const auth = (prisma: PrismaClient) => new Elysia({ name:'auth', prefix: '/auth' })
  .use(jwt({
    name: 'accessJwt',
    secret: process.env.JWT_SECRET || 'fallback-secret',
    algorithms: ['HS256'],
    exp: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  }))
  .use(jwt({
    name: 'refreshJwt',
    secret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    algorithms: ['HS256'],
    exp: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  }))
  .decorate('user', null as unknown as UserContext)
  .derive(async ({ accessJwt, cookie: { accessToken } }) => {
    if (!accessToken?.value) {
      return { user: null };
    }
    
    try {
      const payload = await accessJwt.verify(accessToken.value);
      if (!payload || payload.type !== "access") {
        return { user: null };
      }
      return {
        user: {
          id: payload.id,
          email: payload.email
        }
      };
    } catch {
      return { user: null };
    }
  })
  // 미들웨어 데코레이터들
  .decorate('requireAuth', () => requireAuth())
  .decorate('requirePermission', (permission: string) => requirePermission(prisma, permission))
  .decorate('requireAnyPermission', (permissions: string[]) => requireAnyPermission(prisma, permissions))
  .decorate('requireAllPermissions', (permissions: string[]) => requireAllPermissions(prisma, permissions))
  .decorate('requireResourcePermission', (resource: string, action: string) => requireResourcePermission(prisma, resource, action))
  .decorate('requireOwnership', (resourceModel: string, resourceIdField?: string) => requireOwnership(prisma, resourceModel, resourceIdField))
  .decorate('requirePermissionOrOwnership', (permission: string, resourceModel: string, resourceIdField?: string) => requirePermissionOrOwnership(prisma, permission, resourceModel, resourceIdField))
  .post('/login', async ({ accessJwt, refreshJwt, body: { email, password }, cookie: { accessToken, refreshToken }, set }) => {
    if (!email || !validateEmail(email)) {
      set.status = 400;
      return commonErrorsTypebox.validationError('Valid email is required');
    }
    if (!password) {
      set.status = 400;
      return commonErrorsTypebox.validationError('Password is required');
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        set.status = 404;
        return commonErrorsTypebox.notFound('User');
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      const tokens = await generateTokens(user.id, user.email, accessJwt, refreshJwt);
      
      accessToken?.set({
        value: tokens.accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: msToSeconds(getAccessTokenExpiryMs())
      });
      
      refreshToken?.set({
        value: tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: msToSeconds(getRefreshTokenExpiryMs())
      });

      const response: AuthResponse = {
        user: toPublicUser(user),
        tokens
      };

      set.status = 200;
      return createSuccessResponse(response);
    } catch (error) {
      set.status = 500;
      return commonErrorsTypebox.internalError();
    }
  }, {
    detail: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user with email and password, returns JWT tokens'
    },
    body: LoginRequestTypeBox,
    response: {
      200: ApiSuccessResponseGenericTypeBox,
      400: ApiErrorResponseTypeBox,
      401: ApiErrorResponseTypeBox,
      500: ApiErrorResponseTypeBox,
    },
    beforeHandle: ({ body, set }) => {
      const validation = LoginRequestSchema.safeParse(body);
      if (!validation.success) {
        set.status = 400;
        return commonErrorsTypebox.validationError(
          validation.error.issues[0]?.message || 'Validation error',
          validation.error.issues
        );
      }
    }
  })
  .post('/register', async ({ body: { email, password, name }, set, accessJwt, refreshJwt, cookie: { accessToken, refreshToken } }) => {
    if (!email || !validateEmail(email)) {
      set.status = 400;
      return commonErrorsTypebox.validationError('Valid email is required');
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      set.status = 400;
      return commonErrorsTypebox.validationError(passwordValidation.message || 'Invalid password');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      set.status = 409;
      return commonErrorsTypebox.conflict('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        posts: {
          create: []
        }
      },
    });

    const tokens = await generateTokens(user.id, user.email, accessJwt, refreshJwt);
    
    accessToken?.set({
      value: tokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: msToSeconds(getAccessTokenExpiryMs())
    });
    
    refreshToken?.set({
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: msToSeconds(getRefreshTokenExpiryMs())
    });

    const response: AuthResponse = {
      user: toPublicUser(user),
      tokens
    };

    set.status = 201;
    return createSuccessResponse(response);
  }, {
    detail: {
      tags: ['Authentication'],
      summary: 'User registration',
      description: 'Create a new user account with email, password, and name'
    },
    body: RegisterRequestTypeBox,
    response: {
      201: ApiSuccessResponseGenericTypeBox,
      400: ApiErrorResponseTypeBox,
      409: ApiErrorResponseTypeBox,
      500: ApiErrorResponseTypeBox,
    },
    beforeHandle: ({ body, set }) => {
      const validation = RegisterRequestSchema.safeParse(body);
      if (!validation.success) {
        set.status = 400;
        return commonErrorsTypebox.validationError(
          validation.error.issues[0]?.message || 'Validation error',
          validation.error.issues
        );
      }
    }
  })
  .get('/me', async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return commonErrorsTypebox.unauthorized();
    }

    try {
      const fuser = await prisma.user.findUnique({
        where: { id: user.id as number }
      });

      if (!fuser) {
        set.status = 404;
        return commonErrorsTypebox.notFound('User');
      }

      set.status = 200;
      return createSuccessResponse(toPublicUser(fuser));
    } catch (error) {
      set.status = 401;
      return commonErrorsTypebox.unauthorized();
    }
  }, {
    detail: {
      tags: ['Authentication'],
      summary: 'Get current user',
      description: 'Retrieve the current authenticated user information'
    },
    response: {
      200: ApiSuccessResponseGenericTypeBox,
      401: ApiErrorResponseTypeBox,
      404: ApiErrorResponseTypeBox,
    }
  })
  .get('/refresh', async ({ refreshJwt, accessJwt, set, cookie: { refreshToken, accessToken } }) => {
    if (!refreshToken?.value) {
      set.status = 401;
      return commonErrorsTypebox.unauthorized();
    }

    try {
      const payload = await refreshJwt.verify(refreshToken.value) as unknown as RefreshTokenPayload;
      
      if (payload.type !== 'refresh') {
        set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      const newTokens = await generateTokens(payload.id, payload.email, accessJwt, refreshJwt);
      
      accessToken?.set({
        value: newTokens.accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: msToSeconds(getAccessTokenExpiryMs())
      });
      
      refreshToken?.set({
        value: newTokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: msToSeconds(getRefreshTokenExpiryMs())
      });

      set.status = 200;
      return createSuccessResponse({ tokens: newTokens });
    } catch (error) {
      set.status = 401;
      return commonErrorsTypebox.unauthorized();
    }
  }, {
    detail: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Use refresh token to generate new access and refresh tokens'
    },
    response: {
      200: ApiSuccessResponseGenericTypeBox,
      401: ApiErrorResponseTypeBox,
    }
  })
  .get('/logout', ({ set, cookie: { accessToken, refreshToken } }) => {
    accessToken?.remove();
    refreshToken?.remove();
    set.status = 200;
    return createSuccessResponse({ message: "Logged out successfully" });
  }, {
    detail: {
      tags: ['Authentication'],
      summary: 'User logout',
      description: 'Clear authentication tokens and log out the user'
    },
    response: {
      200: ApiSuccessResponseGenericTypeBox,
    }
  })

export default auth;
