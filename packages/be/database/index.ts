import { Elysia, t } from 'elysia';
import type { PrismaClient } from '@prisma/client';
import { 
  createSuccessResponse,
  commonErrorsTypebox,
} from '@vinxen/shared/schema/ApiResponseTypebox';
import { 
  generateCRUDOperations,
  validateId,
  filterUndefined,
  type PaginationOptions} from './utils';
import {
  BulkCreateRequestSchema,
  BulkUpdateRequestSchema,
  BulkDeleteRequestSchema,
  ListQuerySchema,
  ModelParamSchema,
  ErrorResponseSchema,
  SuccessResponseSchema} from './schemas';

export interface DatabasePluginOptions {
  prefix?: string;
  models?: string[];
  enableBulkOperations?: boolean;
  maxLimit?: number;
  permissions?: {
    [model: string]: {
      read?: string;
      write?: string;
      patch?: string;
      delete?: string;
    };
  };
  requireAuth?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<DatabasePluginOptions, 'permissions'>> & { permissions: DatabasePluginOptions['permissions'] } = {
  prefix: '',
  models: [],
  enableBulkOperations: true,
  maxLimit: 100,
  permissions: undefined,
  requireAuth: false
};

export const database = (
  prisma: PrismaClient,
  options: DatabasePluginOptions = {}
) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return new Elysia({ name: 'database', prefix: config.prefix })
    .decorate('prisma', prisma)
    .decorate('crudOps', (modelName: string) => generateCRUDOperations(prisma, modelName))
    
    // Generic CRUD routes for any model
    .group('/:model', (app) => 
      app
        .derive(({ params: { model } }) => {
          if (config.models.length > 0 && !config.models.includes(model)) {
            throw new Error(`Model ${model} is not enabled`);
          }
          return { modelName: model };
        })
        
        // GET /:model - List with pagination
        .get('/', async ({ query, modelName, set, ...ctx }) => {
          // 권한 검사
          const user = (ctx as any).user;
          if (config.requireAuth && !user) {
            set.status = 401;
            return commonErrorsTypebox.unauthorized();
          }
          try {
            const ops = generateCRUDOperations(prisma, modelName);
            const pagination: PaginationOptions = {
              page: query.page ? parseInt(query.page as string) : undefined,
              limit: query.limit ? parseInt(query.limit as string) : undefined,
              orderBy: query.orderBy ? JSON.parse(query.orderBy as string) : undefined
            };
            
            const where = filterUndefined({
              ...Object.fromEntries(
                Object.entries(query).filter(([key]) => 
                  !['page', 'limit', 'orderBy', 'include'].includes(key)
                )
              )
            });
            
            const include = query.include ? JSON.parse(query.include as string) : undefined;
            
            const result = await ops.findMany(pagination, where, include);
            
            set.status = 200;
            return createSuccessResponse(result);
          } catch (error) {
            set.status = 500;
            return commonErrorsTypebox.internalError();
          }
        }, {
          detail: {
            tags: ['CRUD'],
            summary: 'List items with pagination',
            description: 'Retrieve a paginated list of items from the specified model'
          },
          query: ListQuerySchema,
          params: ModelParamSchema,
          response: {
            200: SuccessResponseSchema,
            500: ErrorResponseSchema
          }
        })
        
        // POST /:model - Create
        .post('/', async ({ body, modelName, set, ...ctx }) => {
          // 권한 검사
          const user = (ctx as any).user;
          if (config.requireAuth && !user) {
            set.status = 401;
            return commonErrorsTypebox.unauthorized();
          }
          try {
            const ops = generateCRUDOperations(prisma, modelName);
            const result = await ops.create(body as Record<string, any>);
            
            set.status = 201;
            return createSuccessResponse(result);
          } catch (error) {
            set.status = 500;
            return commonErrorsTypebox.internalError();
          }
        }, {
          detail: {
            tags: ['CRUD'],
            summary: 'Create a new item',
            description: 'Create a new item in the specified model'
          },
          params: ModelParamSchema,
          response: {
            201: SuccessResponseSchema,
            500: ErrorResponseSchema
          }
        })
        
        // GET /:model/:id - Find by ID
        .get('/:id', async ({ params: { id }, modelName, set, ...ctx }) => {
          // 권한 검사
          const user = (ctx as any).user;
          if (config.requireAuth && !user) {
            set.status = 401;
            return commonErrorsTypebox.unauthorized();
          }
          try {
            const numId = validateId(id);
            const ops = generateCRUDOperations(prisma, modelName);
            const result = await ops.findById(numId);
            
            if (!result) {
              set.status = 404;
              return commonErrorsTypebox.notFound(modelName);
            }
            
            set.status = 200;
            return createSuccessResponse(result);
          } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid ID')) {
              set.status = 400;
              return commonErrorsTypebox.validationError(error.message);
            }
            set.status = 500;
            return commonErrorsTypebox.internalError();
          }
        }, {
          detail: {
            tags: ['CRUD'],
            summary: 'Get item by ID',
            description: 'Retrieve a single item by its ID from the specified model'
          },
          params: t.Object({
            model: t.String(),
            id: t.String()
          }),
          response: {
            200: SuccessResponseSchema,
            400: ErrorResponseSchema,
            404: ErrorResponseSchema,
            500: ErrorResponseSchema
          }
        })
        
        // PUT /:model/:id - Update
        .put('/:id', async ({ params: { id }, body, modelName, set, ...ctx }) => {
          // 권한 검사
          const user = (ctx as any).user;
          if (config.requireAuth && !user) {
            set.status = 401;
            return commonErrorsTypebox.unauthorized();
          }
          try {
            const numId = validateId(id);
            const ops = generateCRUDOperations(prisma, modelName);
            const result = await ops.update(numId, body as Record<string, any>);
            
            set.status = 200;
            return createSuccessResponse(result);
          } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid ID')) {
              set.status = 400;
              return commonErrorsTypebox.validationError(error.message);
            }
            set.status = 500;
            return commonErrorsTypebox.internalError();
          }
        }, {
          detail: {
            tags: ['CRUD'],
            summary: 'Update item by ID',
            description: 'Update an existing item by its ID in the specified model'
          },
          params: t.Object({
            model: t.String(),
            id: t.String()
          }),
          response: {
            200: SuccessResponseSchema,
            400: ErrorResponseSchema,
            500: ErrorResponseSchema
          }
        })
        
        // DELETE /:model/:id - Delete
        .delete('/:id', async ({ params: { id }, modelName, set, ...ctx }) => {
          // 권한 검사
          const user = (ctx as any).user;
          if (config.requireAuth && !user) {
            set.status = 401;
            return commonErrorsTypebox.unauthorized();
          }
          try {
            const numId = validateId(id);
            const ops = generateCRUDOperations(prisma, modelName);
            const result = await ops.delete(numId);
            
            set.status = 200;
            return createSuccessResponse(result);
          } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid ID')) {
              set.status = 400;
              return commonErrorsTypebox.validationError(error.message);
            }
            set.status = 500;
            return commonErrorsTypebox.internalError();
          }
        }, {
          detail: {
            tags: ['CRUD'],
            summary: 'Delete item by ID',
            description: 'Delete an existing item by its ID from the specified model'
          },
          params: t.Object({
            model: t.String(),
            id: t.String()
          }),
          response: {
            200: SuccessResponseSchema,
            400: ErrorResponseSchema,
            500: ErrorResponseSchema
          }
        })
        
        // PATCH /:model/:id - Partial update
        .patch('/:id', async ({ params: { id }, body, modelName, set, ...ctx }) => {
          // 권한 검사
          const user = (ctx as any).user;
          if (config.requireAuth && !user) {
            set.status = 401;
            return commonErrorsTypebox.unauthorized();
          }
          try {
            const numId = validateId(id);
            const ops = generateCRUDOperations(prisma, modelName);
            const filteredBody = filterUndefined(body as Record<string, any>);
            const result = await ops.update(numId, filteredBody);
            
            set.status = 200;
            return createSuccessResponse(result);
          } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid ID')) {
              set.status = 400;
              return commonErrorsTypebox.validationError(error.message);
            }
            set.status = 500;
            return commonErrorsTypebox.internalError();
          }
        }, {
          detail: {
            tags: ['CRUD'],
            summary: 'Partially update item by ID',
            description: 'Partially update an existing item by its ID in the specified model'
          },
          params: t.Object({
            model: t.String(),
            id: t.String()
          }),
          response: {
            200: SuccessResponseSchema,
            400: ErrorResponseSchema,
            500: ErrorResponseSchema
          }
        })
        
        // Bulk operations (if enabled)
        .group('/bulk', (bulkApp) => {
          if (!config.enableBulkOperations) {
            return bulkApp;
          }
          
          return bulkApp
            // POST /:model/bulk - Create many
            .post('/', async ({ body, modelName, set }) => {
              try {
                const ops = generateCRUDOperations(prisma, modelName);
                const result = await ops.createMany(Array.isArray(body) ? body : [body]);
                
                set.status = 201;
                return createSuccessResponse(result);
              } catch (error) {
                set.status = 500;
                return commonErrorsTypebox.internalError();
              }
            }, {
              detail: {
                tags: ['Bulk'],
                summary: 'Create multiple items',
                description: 'Create multiple items in the specified model'
              },
              body: BulkCreateRequestSchema,
              params: ModelParamSchema,
              response: {
                201: SuccessResponseSchema,
                500: ErrorResponseSchema
              }
            })
            
            // PUT /:model/bulk - Update many
            .put('/', async ({ body, modelName, set }) => {
              try {
                const ops = generateCRUDOperations(prisma, modelName);
                const { where, data } = body as { where: Record<string, any>, data: Record<string, any> };
                const result = await ops.updateMany(where, data);
                
                set.status = 200;
                return createSuccessResponse(result);
              } catch (error) {
                set.status = 500;
                return commonErrorsTypebox.internalError();
              }
            }, {
              detail: {
                tags: ['Bulk'],
                summary: 'Update multiple items',
                description: 'Update multiple items in the specified model based on filter conditions'
              },
              body: BulkUpdateRequestSchema,
              params: ModelParamSchema,
              response: {
                200: SuccessResponseSchema,
                500: ErrorResponseSchema
              }
            })
            
            // DELETE /:model/bulk - Delete many
            .delete('/', async ({ body, modelName, set }) => {
              try {
                const ops = generateCRUDOperations(prisma, modelName);
                const where = body as Record<string, any>;
                const result = await ops.deleteMany(where);
                
                set.status = 200;
                return createSuccessResponse(result);
              } catch (error) {
                set.status = 500;
                return commonErrorsTypebox.internalError();
              }
            }, {
              detail: {
                tags: ['Bulk'],
                summary: 'Delete multiple items',
                description: 'Delete multiple items in the specified model based on filter conditions'
              },
              body: BulkDeleteRequestSchema,
              params: ModelParamSchema,
              response: {
                200: SuccessResponseSchema,
                500: ErrorResponseSchema
              }
            });
        })
    );
};

export default database;