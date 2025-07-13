import { t } from 'elysia';

// 동적으로 Prisma 모델 스키마를 가져오는 함수
export const getModelSchemas = async (modelName: string) => {
  try {
    // 모델명을 파스칼 케이스로 변환 (user -> User)
    const modelNamePascal = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    
    // 동적으로 해당 모델의 스키마를 가져옴
    const modelSchemas = await import(`@vinxen/shared/generated/prismabox/${modelNamePascal}`);
    
    return {
      create: modelSchemas[`${modelNamePascal}Plain`] || t.Object({}),
      update: t.Partial(modelSchemas[`${modelNamePascal}Plain`] || t.Object({})),
      where: modelSchemas[`${modelNamePascal}Where`] || t.Object({}),
      whereUnique: modelSchemas[`${modelNamePascal}WhereUnique`] || t.Object({}),
      orderBy: modelSchemas[`${modelNamePascal}OrderBy`] || t.Object({}),
      include: modelSchemas[`${modelNamePascal}Include`] || t.Object({})
    };
  } catch (error) {
    // 스키마를 찾을 수 없는 경우 기본 스키마 반환
    return {
      create: t.Object({}),
      update: t.Object({}),
      where: t.Object({}),
      whereUnique: t.Object({}),
      orderBy: t.Object({}),
      include: t.Object({})
    };
  }
};

// 기본 스키마들 (변경 불필요)
export const BulkCreateRequestSchema = t.Array(t.Object({}), {
  description: 'Array of objects to create',
  example: [
    { name: 'Item 1', email: 'item1@email.com' },
    { name: 'Item 2', email: 'item2@email.com' }
  ]
});

export const BulkUpdateRequestSchema = t.Object({
  where: t.Object({}, { description: 'Filter conditions' }),
  data: t.Object({}, { description: 'Data to update' })
}, {
  description: 'Bulk update request',
  example: {
    where: { status: 'inactive' },
    data: { status: 'active' }
  }
});

export const BulkDeleteRequestSchema = t.Object({
  where: t.Object({}, { description: 'Filter conditions for deletion' })
}, {
  description: 'Bulk delete request',
  example: { where: { status: 'deleted' } }
});

export const ListQuerySchema = t.Object({
  page: t.Optional(t.String({ description: 'Page number', example: '1' })),
  limit: t.Optional(t.String({ description: 'Items per page', example: '10' })),
  orderBy: t.Optional(t.String({ description: 'Sorting JSON', example: '{"id":"desc"}' })),
  include: t.Optional(t.String({ description: 'Relations JSON', example: '{"posts":true}' }))
});

export const ModelParamSchema = t.Object({
  model: t.String({ description: 'Model name', example: 'user' })
});

export const PaginationMetaSchema = t.Object({
  page: t.Number({ example: 1 }),
  limit: t.Number({ example: 10 }),
  total: t.Number({ example: 100 }),
  totalPages: t.Number({ example: 10 }),
  hasNext: t.Boolean({ example: true }),
  hasPrev: t.Boolean({ example: false })
});

export const SuccessResponseSchema = t.Object({
  data: t.Any(),
  success: t.Boolean({ example: true }),
  timestamp: t.String({ example: '2024-01-01T00:00:00.000Z' })
});

export const ErrorResponseSchema = t.Object({
  error: t.Object({
    message: t.String({ example: 'Error message' }),
    code: t.Optional(t.String({ example: 'ERROR_CODE' })),
    details: t.Optional(t.Any())
  }),
  success: t.Boolean({ example: false }),
  timestamp: t.String({ example: '2024-01-01T00:00:00.000Z' })
});