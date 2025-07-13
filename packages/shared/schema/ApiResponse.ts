import { z } from "zod";

// Error schema
export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

// Success response schema
export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    success: z.literal(true),
    timestamp: z.string().datetime(),
  });

// Error response schema
export const ApiErrorResponseSchema = z.object({
  error: ApiErrorSchema,
  success: z.literal(false),
  timestamp: z.string().datetime(),
});

// Generic API response schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    ApiSuccessResponseSchema(dataSchema),
    ApiErrorResponseSchema
  ]);

// Base types
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiSuccessResponse<T = any> = {
  data: T;
  success: true;
  timestamp: string;
};
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Legacy export for compatibility
export const ApiResponseZod = ApiResponseSchema(z.any());

// Helper functions
export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  data,
  success: true,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  message: string,
  code?: string,
  details?: any
): ApiErrorResponse => ({
  error: {
    message,
    code,
    details,
  },
  success: false,
  timestamp: new Date().toISOString(),
});

// Common error responses
export const commonErrors = {
  unauthorized: () => createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
  forbidden: () => createErrorResponse('Forbidden', 'FORBIDDEN'),
  notFound: (resource: string = 'Resource') => 
    createErrorResponse(`${resource} not found`, 'NOT_FOUND'),
  conflict: (message: string = 'Conflict') => 
    createErrorResponse(message, 'CONFLICT'),
  validationError: (message: string, details?: any) => 
    createErrorResponse(message, 'VALIDATION_ERROR', details),
  internalError: () => 
    createErrorResponse('Internal server error', 'INTERNAL_ERROR'),
} as const;
