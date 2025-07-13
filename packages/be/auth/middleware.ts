import { Elysia } from 'elysia';
import type { PrismaClient } from '@prisma/client';
import { commonErrorsTypebox } from '@vinxen/shared/schema/ApiResponseTypebox';
import type { UserContext } from '@vinxen/shared/schema/auth';
import { hasPermission, hasAnyPermission, hasAllPermissions, createPermission } from './permissions';

// 기본 인증 미들웨어
export const requireAuth = () => {
  return new Elysia()
    .derive(async (ctx: any) => {
      if (!ctx.user) {
        ctx.set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }
      return { user: ctx.user as NonNullable<UserContext> };
    });
};

// 권한 체크 미들웨어
export const requirePermission = (prisma: PrismaClient, permission: string) => {
  return new Elysia()
    .derive(async (ctx: any) => {
      if (!ctx.user) {
        ctx.set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      // 데이터베이스에서 사용자 권한 조회
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { permissions: true }
      });

      if (!user || !hasPermission(user.permissions.map(p => p.name), permission)) {
        ctx.set.status = 403;
        return commonErrorsTypebox.forbidden();
      }

      return { user: ctx.user as NonNullable<UserContext> };
    });
};

// 여러 권한 중 하나라도 있으면 허용
export const requireAnyPermission = (prisma: PrismaClient, permissions: string[]) => {
  return new Elysia()
    .derive(async (ctx: any) => {
      if (!ctx.user) {
        ctx.set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { permissions: true }
      });

      if (!user || !hasAnyPermission(user.permissions.map(p => p.name), permissions)) {
        ctx.set.status = 403;
        return commonErrorsTypebox.forbidden();
      }

      return { user: ctx.user as NonNullable<UserContext> };
    });
};

// 모든 권한이 있어야 허용
export const requireAllPermissions = (prisma: PrismaClient, permissions: string[]) => {
  return new Elysia()
    .derive(async (ctx: any) => {
      if (!ctx.user) {
        ctx.set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { permissions: true }
      });

      if (!user || !hasAllPermissions(user.permissions.map(p => p.name), permissions)) {
        ctx.set.status = 403;
        return commonErrorsTypebox.forbidden();
      }

      return { user: ctx.user as NonNullable<UserContext> };
    });
};

// 리소스별 권한 체크 미들웨어
export const requireResourcePermission = (prisma: PrismaClient, resource: string, action: string) => {
  const permission = createPermission(resource, action);
  return requirePermission(prisma, permission);
};

// 소유자 권한 체크 미들웨어 (자신의 리소스만 접근 가능)
export const requireOwnership = (prisma: PrismaClient, resourceModel: string, resourceIdField: string = 'id') => {
  return new Elysia()
    .derive(async (ctx: any) => {
      if (!ctx.user) {
        ctx.set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      const resourceId = ctx.params?.[resourceIdField];
      if (!resourceId) {
        ctx.set.status = 400;
        return commonErrorsTypebox.validationError('Resource ID is required');
      }

      // 동적으로 모델 접근
      const delegate = (prisma as any)[resourceModel];
      if (!delegate) {
        ctx.set.status = 500;
        return commonErrorsTypebox.internalError();
      }

      const resource = await delegate.findUnique({
        where: { id: parseInt(resourceId) },
        select: { authorId: true, userId: true, ownerId: true } // 가능한 소유자 필드들
      });

      if (!resource) {
        ctx.set.status = 404;
        return commonErrorsTypebox.notFound(resourceModel);
      }

      // 소유자 확인 (authorId, userId, ownerId 중 하나라도 일치하면 허용)
      const isOwner = resource.authorId === ctx.user.id || 
                     resource.userId === ctx.user.id || 
                     resource.ownerId === ctx.user.id;

      if (!isOwner) {
        ctx.set.status = 403;
        return commonErrorsTypebox.forbidden();
      }

      return { user: ctx.user as NonNullable<UserContext> };
    });
};

// 조건부 권한 미들웨어 (권한이 있거나 소유자인 경우 허용)
export const requirePermissionOrOwnership = (
  prisma: PrismaClient, 
  permission: string, 
  resourceModel: string, 
  resourceIdField: string = 'id'
) => {
  return new Elysia()
    .derive(async (ctx: any) => {
      if (!ctx.user) {
        ctx.set.status = 401;
        return commonErrorsTypebox.unauthorized();
      }

      // 권한 체크
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { permissions: true }
      });

      if (user && hasPermission(user.permissions.map(p => p.name), permission)) {
        return { user: ctx.user as NonNullable<UserContext> };
      }

      // 소유자 체크
      const resourceId = ctx.params?.[resourceIdField];
      if (!resourceId) {
        ctx.set.status = 400;
        return commonErrorsTypebox.validationError('Resource ID is required');
      }

      const delegate = (prisma as any)[resourceModel];
      if (!delegate) {
        ctx.set.status = 500;
        return commonErrorsTypebox.internalError();
      }

      const resource = await delegate.findUnique({
        where: { id: parseInt(resourceId) },
        select: { authorId: true, userId: true, ownerId: true }
      });

      if (!resource) {
        ctx.set.status = 404;
        return commonErrorsTypebox.notFound(resourceModel);
      }

      const isOwner = resource.authorId === ctx.user.id || 
                     resource.userId === ctx.user.id || 
                     resource.ownerId === ctx.user.id;

      if (!isOwner) {
        ctx.set.status = 403;
        return commonErrorsTypebox.forbidden();
      }

      return { user: ctx.user as NonNullable<UserContext> };
    });
};