// Main database module
export { default as database } from './index';

// Utility exports
export { 
  generateCRUDOperations,
  validateId,
  filterUndefined,
  sanitizePagination,
  createPaginationMeta,
  DEFAULT_PAGINATION
} from './utils';

// Type exports
export type {
  PrismaClient,
  PaginationOptions,
  PaginatedResult,
  DatabasePluginOptions,
  CRUDOperations,
  BulkCreateRequest,
  BulkUpdateRequest,
  BulkDeleteRequest,
  ListQueryParams
} from './types';

export type {
  ModelName,
  PrismaDelegate
} from './utils';

// Schema exports
export {
  BulkCreateRequestSchema,
  BulkUpdateRequestSchema,
  BulkDeleteRequestSchema,
  ListQuerySchema,
  ModelParamSchema,
  ErrorResponseSchema,
  SuccessResponseSchema,
  getModelSchemas
} from './schemas';