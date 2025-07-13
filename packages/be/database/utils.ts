import type { PrismaClient } from '@prisma/client';

export type ModelName = keyof PrismaClient;
export type PrismaDelegate = PrismaClient[ModelName];

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

export const DEFAULT_PAGINATION: Required<PaginationOptions> = {
  page: 1,
  limit: 10,
  orderBy: { id: 'desc' }
};

export const sanitizePagination = (options: PaginationOptions = {}): Required<PaginationOptions> => {
  const page = Math.max(1, options.page || DEFAULT_PAGINATION.page);
  const limit = Math.min(100, Math.max(1, options.limit || DEFAULT_PAGINATION.limit));
  const orderBy = options.orderBy || DEFAULT_PAGINATION.orderBy;
  
  return { page, limit, orderBy };
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

export const generateCRUDOperations = <T extends Record<string, any>>(
  prisma: PrismaClient,
  modelName: string
) => {
  const delegate = (prisma as any)[modelName];
  
  if (!delegate) {
    throw new Error(`Model ${modelName} not found in Prisma client`);
  }

  return {
    // Create
    async create(data: Partial<T>): Promise<T> {
      return await delegate.create({ data });
    },

    // Read One
    async findById(id: number | string): Promise<T | null> {
      return await delegate.findUnique({ where: { id } });
    },

    // Read Many with pagination
    async findMany(
      options: PaginationOptions = {},
      where: Record<string, any> = {},
      include?: Record<string, any>
    ): Promise<PaginatedResult<T>> {
      const { page, limit, orderBy } = sanitizePagination(options);
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        delegate.findMany({
          where,
          include,
          skip,
          take: limit,
          orderBy
        }),
        delegate.count({ where })
      ]);

      return {
        data,
        meta: createPaginationMeta(page, limit, total)
      };
    },

    // Update
    async update(id: number | string, data: Partial<T>): Promise<T> {
      return await delegate.update({
        where: { id },
        data
      });
    },

    // Delete
    async delete(id: number | string): Promise<T> {
      return await delegate.delete({ where: { id } });
    },

    // Upsert
    async upsert(
      where: Record<string, any>,
      create: Partial<T>,
      update: Partial<T>
    ): Promise<T> {
      return await delegate.upsert({
        where,
        create,
        update
      });
    },

    // Bulk operations
    async createMany(data: Partial<T>[]): Promise<{ count: number }> {
      return await delegate.createMany({ data });
    },

    async updateMany(
      where: Record<string, any>,
      data: Partial<T>
    ): Promise<{ count: number }> {
      return await delegate.updateMany({ where, data });
    },

    async deleteMany(where: Record<string, any>): Promise<{ count: number }> {
      return await delegate.deleteMany({ where });
    }
  };
};

export const validateId = (id: string | number): number => {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid ID: must be a positive number');
  }
  
  return numId;
};

export const filterUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const filtered = {} as Partial<T>;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key as keyof T] = value;
    }
  }
  
  return filtered;
};