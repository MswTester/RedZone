# @vinxen/database

Prisma 기반 자동 CRUD API 생성 Elysia 플러그인입니다.

## 설치

```bash
bun add @vinxen/database
```

## 기본 사용법

```typescript
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { database } from '@vinxen/database';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(database(prisma))
  .listen(3000);
```

## 주요 기능

- **자동 CRUD 생성**: Prisma 모델을 기반으로 자동으로 REST API 엔드포인트 생성
- **동적 스키마**: Prisma 생성 TypeBox 스키마 자동 로드
- **페이지네이션**: 내장 페이지네이션 지원
- **권한 시스템**: 모델별 세밀한 권한 제어
- **벌크 작업**: 대량 생성/수정/삭제 작업 지원
- **관계 데이터**: include를 통한 관계 데이터 로드

## 설정 옵션

```typescript
interface DatabasePluginOptions {
  prefix?: string;                    // API 경로 프리픽스 (기본값: '')
  models?: string[];                  // 허용된 모델 목록 (빈 배열 시 모든 모델 허용)
  enableBulkOperations?: boolean;     // 벌크 작업 활성화 (기본값: true)
  maxLimit?: number;                  // 최대 페이지 크기 (기본값: 100)
  requireAuth?: boolean;              // 인증 필수 여부 (기본값: false)
  permissions?: {                     // 모델별 권한 설정
    [model: string]: {
      read?: string;
      write?: string;
      patch?: string;
      delete?: string;
    };
  };
}
```

## 기본 CRUD 엔드포인트

모든 Prisma 모델에 대해 자동으로 생성되는 엔드포인트들입니다.

### GET /{prefix}/{model}
모델의 모든 레코드를 페이지네이션과 함께 조회합니다.

**Query Parameters:**
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지 크기 (기본값: 10, 최대값: 설정된 maxLimit)
- `orderBy` (string): 정렬 설정 (JSON 형태)
- `include` (string): 관계 데이터 포함 설정 (JSON 형태)
- 기타 모델 필드들 (필터링용)

**예시:**
```bash
GET /api/user?page=1&limit=5&orderBy={"id":"desc"}&include={"posts":true}
```

**Response:**
```json
{
  "data": {
    "data": [
      {
        "id": 1,
        "email": "user@example.com",
        "name": "사용자",
        "posts": [...]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 5,
      "total": 10,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /{prefix}/{model}
새로운 레코드를 생성합니다.

**Request Body:**
```json
{
  "email": "new@example.com",
  "name": "새 사용자",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "id": 2,
    "email": "new@example.com",
    "name": "새 사용자",
    "password": "hashed_password"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /{prefix}/{model}/{id}
특정 ID의 레코드를 조회합니다.

**Response:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "사용자"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### PUT /{prefix}/{model}/{id}
특정 ID의 레코드를 완전히 업데이트합니다.

**Request Body:**
```json
{
  "email": "updated@example.com",
  "name": "업데이트된 사용자"
}
```

### PATCH /{prefix}/{model}/{id}
특정 ID의 레코드를 부분적으로 업데이트합니다.

**Request Body:**
```json
{
  "name": "부분 업데이트된 사용자"
}
```

### DELETE /{prefix}/{model}/{id}
특정 ID의 레코드를 삭제합니다.

**Response:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "사용자"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 벌크 작업 엔드포인트

### POST /{prefix}/{model}/bulk
여러 레코드를 일괄 생성합니다.

**Request Body:**
```json
[
  {
    "email": "user1@example.com",
    "name": "사용자1"
  },
  {
    "email": "user2@example.com",
    "name": "사용자2"
  }
]
```

**Response:**
```json
{
  "data": {
    "count": 2
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### PUT /{prefix}/{model}/bulk
조건에 맞는 여러 레코드를 일괄 업데이트합니다.

**Request Body:**
```json
{
  "where": {
    "email": {
      "contains": "@example.com"
    }
  },
  "data": {
    "name": "업데이트된 이름"
  }
}
```

### DELETE /{prefix}/{model}/bulk
조건에 맞는 여러 레코드를 일괄 삭제합니다.

**Request Body:**
```json
{
  "email": {
    "contains": "@test.com"
  }
}
```

## 사용 예시

### 기본 설정

```typescript
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { database } from '@vinxen/database';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(database(prisma, {
    prefix: '/api',
    models: ['user', 'post'], // user와 post 모델만 허용
    maxLimit: 50
  }))
  .listen(3000);
```

### 권한 기반 설정

```typescript
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { database } from '@vinxen/database';
import { auth } from '@vinxen/auth';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(auth(prisma)) // 인증 플러그인 먼저 등록
  .use(database(prisma, {
    prefix: '/api',
    requireAuth: true, // 모든 엔드포인트에 인증 필요
    permissions: {
      user: {
        read: 'user:read',
        write: 'user:write',
        patch: 'user:patch',
        delete: 'user:delete'
      },
      post: {
        read: 'post:read',
        write: 'post:write',
        patch: 'post:patch',
        delete: 'post:delete'
      }
    }
  }))
  .listen(3000);
```

### 선택적 권한 설정

```typescript
const app = new Elysia()
  .use(auth(prisma))
  .use(database(prisma, {
    prefix: '/api',
    permissions: {
      user: {
        read: 'user:read',
        write: 'admin:write', // 관리자만 사용자 생성 가능
        patch: 'user:patch',
        delete: 'admin:delete' // 관리자만 사용자 삭제 가능
      },
      post: {
        // read는 권한 없이 누구나 가능
        write: 'post:write',
        patch: 'post:patch',
        delete: 'post:delete'
      }
    }
  }))
  .listen(3000);
```

## 고급 사용법

### 커스텀 라우트와 함께 사용

```typescript
const app = new Elysia()
  .use(database(prisma, { prefix: '/api' }))
  
  // 커스텀 라우트
  .get('/api/user/:id/posts', async ({ params }) => {
    const posts = await prisma.post.findMany({
      where: { authorId: parseInt(params.id) },
      include: { author: true }
    });
    return { posts };
  })
  
  // 커스텀 검색 라우트
  .get('/api/search/users', async ({ query }) => {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.q } },
          { email: { contains: query.q } }
        ]
      }
    });
    return { users };
  })
  
  .listen(3000);
```

### 관계 데이터 활용

```typescript
// 사용자와 포스트를 함께 조회
GET /api/user?include={"posts":true}

// 포스트와 작성자를 함께 조회
GET /api/post?include={"author":true}

// 복잡한 관계 데이터 조회
GET /api/user?include={"posts":{"include":{"author":true}}}
```

### 필터링과 정렬

```typescript
// 이메일로 필터링
GET /api/user?email=user@example.com

// 부분 일치 검색 (Prisma where 문법 사용)
GET /api/user?name={"contains":"john"}

// 정렬
GET /api/user?orderBy={"createdAt":"desc"}

// 복합 정렬
GET /api/user?orderBy=[{"name":"asc"},{"createdAt":"desc"}]
```

## 에러 처리

database 플러그인은 표준 HTTP 상태 코드를 반환합니다:

- `200 OK` - 성공적인 조회/업데이트
- `201 Created` - 성공적인 생성
- `400 Bad Request` - 잘못된 요청 데이터
- `401 Unauthorized` - 인증되지 않은 사용자
- `403 Forbidden` - 권한이 없는 사용자
- `404 Not Found` - 존재하지 않는 리소스
- `500 Internal Server Error` - 서버 내부 오류

## 보안 고려사항

1. **모델 제한**: `models` 옵션을 사용하여 공개할 모델을 제한하세요
2. **권한 설정**: 민감한 데이터에 대해서는 적절한 권한을 설정하세요
3. **인증 필수**: 중요한 데이터에 대해서는 `requireAuth: true`를 설정하세요
4. **페이지 크기 제한**: `maxLimit`을 적절히 설정하여 DoS 공격을 방지하세요
5. **입력 검증**: Prisma 스키마의 제약 조건을 활용하여 입력을 검증하세요

## 제한사항

1. **복잡한 쿼리**: 복잡한 비즈니스 로직이 필요한 경우 별도의 커스텀 라우트를 구현하세요
2. **파일 업로드**: 파일 업로드는 지원하지 않습니다. 별도의 파일 서버를 구축하세요
3. **트랜잭션**: 복잡한 트랜잭션이 필요한 경우 커스텀 라우트를 구현하세요
4. **실시간 기능**: WebSocket이나 Server-Sent Events는 지원하지 않습니다

## 필수 의존성

- `@prisma/client`: Prisma 클라이언트
- `@vinxen/shared`: 공유 스키마 및 유틸리티
- `elysia`: Elysia 프레임워크

## 권장 Prisma 스키마 구조

```prisma
model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  name        String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // 관계 필드
  posts       Post[]
  permissions Permission[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 관계 필드
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}

model Permission {
  id     Int    @id @default(autoincrement())
  name   String
  userId Int
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, name])
}
```

## 디버깅 및 모니터링

개발 시 유용한 팁들:

1. **Swagger 문서**: 자동 생성된 API 문서를 확인하세요
2. **Prisma Studio**: 데이터베이스 상태를 시각적으로 확인하세요
3. **로그 확인**: Prisma 쿼리 로그를 활성화하여 성능을 모니터링하세요
4. **에러 응답**: 에러 발생 시 상세한 에러 메시지를 확인하세요

```typescript
// Prisma 쿼리 로그 활성화
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```