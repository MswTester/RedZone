import { Type, type Static } from '@sinclair/typebox';

// Error schema
export const ApiErrorTypeBox = Type.Object({
  message: Type.String(),
  code: Type.Optional(Type.String()),
  details: Type.Optional(Type.Any()),
});

// Success response schema
export const ApiSuccessResponseTypeBox = <T extends Parameters<typeof Type.Object>[0]>(dataSchema: T) =>
  Type.Object({
    data: Type.Object(dataSchema),
    success: Type.Literal(true),
    timestamp: Type.String({ format: 'date-time' }),
  });

// Generic data success response
export const ApiSuccessResponseGenericTypeBox = Type.Object({
  data: Type.Any(),
  success: Type.Literal(true),
  timestamp: Type.String({ format: 'date-time' }),
});

// Error response schema
export const ApiErrorResponseTypeBox = Type.Object({
  error: ApiErrorTypeBox,
  success: Type.Literal(false),
  timestamp: Type.String({ format: 'date-time' }),
});

// Union response schema
export const ApiResponseTypeBox = Type.Union([
  ApiSuccessResponseGenericTypeBox,
  ApiErrorResponseTypeBox
]);

// Types
export type ApiErrorType = Static<typeof ApiErrorTypeBox>;
export type ApiSuccessResponseType<T = any> = {
  data: T;
  success: true;
  timestamp: string;
};
export type ApiErrorResponseType = Static<typeof ApiErrorResponseTypeBox>;
export type ApiResponseType<T = any> = ApiSuccessResponseType<T> | ApiErrorResponseType;

// Helper functions (same as Zod version for consistency)
export const createSuccessResponse = <T>(data: T): ApiSuccessResponseType<T> => ({
  data,
  success: true,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  message: string,
  code?: string,
  details?: any
): ApiErrorResponseType => ({
  error: {
    message,
    code,
    details,
  },
  success: false,
  timestamp: new Date().toISOString(),
});

// Common error responses
export const commonErrorsTypebox = {
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