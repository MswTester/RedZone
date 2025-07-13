// src/index.ts
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { PrismaClient } from '@prisma/client';
import { ApiSuccessResponseGenericTypeBox, createSuccessResponse, createErrorResponse } from '@vinxen/shared/schema/ApiResponseTypebox';
import { auth } from "@vinxen/auth";
import { database } from '@vinxen/database';
import { Type } from '@sinclair/typebox';
import { analyzeImage } from '@vinxen/gemini';

const prisma = new PrismaClient();

prisma.$connect().then(() => {
  console.log('Connected to database');
}).catch((e: Error) => {
  console.error('Failed to connect to database', e);
});

const app = new Elysia()
  .decorate('prisma', prisma)
  .use(cors({
    origin: '*',
    credentials: true,
  }))
  .use(swagger())
  // .use(auth(prisma))
  .use(database(prisma, {
    prefix: '/api'
  }))

  // AI Image analysis route
  .post('/api/ai/gemini/analyze-image', async ({ body, set }) => {
    try {
      const { imageBase64 } = body as { imageBase64: string };
      if (!imageBase64) {
        set.status = 400 as any;
        return createErrorResponse('`imageBase64` is required', 'VALIDATION_ERROR') as any;
      }
      const analysis = await analyzeImage(imageBase64);
      return createSuccessResponse(analysis);
    } catch (err: any) {
      console.error('Gemini analysis failed', err);
      set.status = 500 as any;
      return createErrorResponse('Failed to analyze image', 'GEMINI_ERROR') as any;
    }
  }, {
    body: Type.Object({
      imageBase64: Type.String(),
    }),
    response: {
      200: ApiSuccessResponseGenericTypeBox,
    }
  })

  // Public routes
  .get('/health', () => createSuccessResponse({ 
    status: 'ok'
  }), {
    response: {
      200: ApiSuccessResponseGenericTypeBox,
    }
  })

  .listen(process.env.PORT || 3000, () => {
    console.log('Swagger UI on http://localhost:3000/swagger');
  });

export default app;