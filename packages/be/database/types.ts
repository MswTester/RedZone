// Re-export Prisma types for convenience
export type { PrismaClient } from '@prisma/client';

// Database plugin specific types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DatabasePluginOptions {
  prefix?: string;
  models?: string[];
  enableBulkOperations?: boolean;
  maxLimit?: number;
}

export interface CRUDOperations<T = any> {
  create(data: Partial<T>): Promise<T>;
  findById(id: number | string): Promise<T | null>;
  findMany(
    options?: PaginationOptions,
    where?: Record<string, any>,
    include?: Record<string, any>
  ): Promise<PaginatedResult<T>>;
  update(id: number | string, data: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<T>;
  upsert(
    where: Record<string, any>,
    create: Partial<T>,
    update: Partial<T>
  ): Promise<T>;
  createMany(data: Partial<T>[]): Promise<{ count: number }>;
  updateMany(
    where: Record<string, any>,
    data: Partial<T>
  ): Promise<{ count: number }>;
  deleteMany(where: Record<string, any>): Promise<{ count: number }>;
}

export interface BulkCreateRequest<T = any> {
  data: Partial<T>[];
}

export interface BulkUpdateRequest<T = any> {
  where: Record<string, any>;
  data: Partial<T>;
}

export interface BulkDeleteRequest {
  where: Record<string, any>;
}

// Query parameter types
export interface ListQueryParams {
  page?: string;
  limit?: string;
  orderBy?: string;
  include?: string;
  [key: string]: string | undefined;
}