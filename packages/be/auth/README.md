# @vinxen/auth

JWT 기반 인증 시스템을 제공하는 Elysia 플러그인입니다.

## 설치

```bash
bun add @vinxen/auth
```

## 기본 사용법

```typescript
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { auth } from '@vinxen/auth';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(auth(prisma))
  .listen(3000);
```

## 인증 엔드포인트

### POST /auth/register
새로운 사용자를 등록합니다.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "사용자 이름"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "사용자 이름"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /auth/login
기존 사용자로 로그인합니다.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "사용자 이름"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /auth/me
현재 로그인된 사용자 정보를 조회합니다.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "사용자 이름",
    "permissions": [
      { "id": 1, "name": "user:read", "userId": 1 },
      { "id": 2, "name": "user:write", "userId": 1 }
    ]
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /auth/refresh
리프레시 토큰으로 새 액세스 토큰을 발급받습니다.

**Headers:**
```
Authorization: Bearer {refreshToken}
```

**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /auth/logout
로그아웃합니다.

**Response:**
```json
{
  "data": {
    "message": "Successfully logged out"
  },
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 미들웨어

### requireAuth()
인증이 필요한 라우트에 사용합니다.

```typescript
import { requireAuth } from '@vinxen/auth';

app.use(requireAuth())
  .get('/protected', ({ user }) => {
    return { message: `Hello, ${user.name}!` };
  });
```

### requirePermission(prisma, permission)
특정 권한이 필요한 라우트에 사용합니다.

```typescript
import { requirePermission } from '@vinxen/auth';

app.use(requirePermission(prisma, 'user:write'))
  .post('/admin/users', ({ user }) => {
    // user:write 권한이 있는 사용자만 접근 가능
  });
```

### requireAnyPermission(prisma, permissions)
여러 권한 중 하나라도 있으면 접근을 허용합니다.

```typescript
import { requireAnyPermission } from '@vinxen/auth';

app.use(requireAnyPermission(prisma, ['user:read', 'admin:read']))
  .get('/dashboard', ({ user }) => {
    // user:read 또는 admin:read 권한이 있는 사용자만 접근 가능
  });
```

### requireAllPermissions(prisma, permissions)
모든 권한이 있어야 접근을 허용합니다.

```typescript
import { requireAllPermissions } from '@vinxen/auth';

app.use(requireAllPermissions(prisma, ['user:write', 'admin:write']))
  .post('/admin/system', ({ user }) => {
    // user:write와 admin:write 권한이 모두 있는 사용자만 접근 가능
  });
```

### requireResourcePermission(prisma, resource, action)
리소스별 권한을 체크합니다.

```typescript
import { requireResourcePermission } from '@vinxen/auth';

app.use(requireResourcePermission(prisma, 'post', 'write'))
  .post('/posts', ({ user }) => {
    // post:write 권한이 있는 사용자만 접근 가능
  });
```

### requireOwnership(prisma, resourceModel, resourceIdField)
리소스의 소유자만 접근할 수 있도록 합니다.

```typescript
import { requireOwnership } from '@vinxen/auth';

app.use(requireOwnership(prisma, 'post', 'id'))
  .put('/posts/:id', ({ user, params }) => {
    // 해당 포스트의 소유자(authorId가 user.id인 경우)만 접근 가능
  });
```

### requirePermissionOrOwnership(prisma, permission, resourceModel, resourceIdField)
권한이 있거나 소유자인 경우 접근을 허용합니다.

```typescript
import { requirePermissionOrOwnership } from '@vinxen/auth';

app.use(requirePermissionOrOwnership(prisma, 'post:delete', 'post', 'id'))
  .delete('/posts/:id', ({ user, params }) => {
    // post:delete 권한이 있거나 해당 포스트의 소유자인 경우 접근 가능
  });
```

## 권한 시스템

### 기본 권한
시스템에서 자동으로 생성되는 기본 권한들입니다:

- `read` - 읽기 권한
- `write` - 쓰기 권한  
- `patch` - 수정 권한
- `delete` - 삭제 권한

### 권한 유틸리티 함수

```typescript
import { 
  createPermission, 
  createBasicPermissions, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions 
} from '@vinxen/auth';

// 권한 생성
const userReadPermission = createPermission('user', 'read'); // "user:read"

// 기본 권한 생성
const userPermissions = createBasicPermissions('user'); 
// ["user:read", "user:write", "user:patch", "user:delete"]

// 권한 체크
const userPermissions = ['user:read', 'user:write'];
hasPermission(userPermissions, 'user:read'); // true
hasAnyPermission(userPermissions, ['user:read', 'admin:read']); // true
hasAllPermissions(userPermissions, ['user:read', 'user:write']); // true
```

## 환경 변수

```env
# JWT 시크릿 키
JWT_SECRET=your-secret-key-here

# JWT 액세스 토큰 만료 시간 (기본: 15분)
JWT_ACCESS_EXPIRES_IN=15m

# JWT 리프레시 토큰 만료 시간 (기본: 7일)
JWT_REFRESH_EXPIRES_IN=7d
```

## 필수 Prisma 모델

auth 플러그인을 사용하려면 다음 모델들이 schema.prisma에 정의되어 있어야 합니다:

```prisma
model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  password    String
  name        String
  permissions Permission[]
  posts       Post[]
}

model Permission {
  id     Int    @id @default(autoincrement())
  name   String
  userId Int
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, name])
}
```

## 사용 예시

### 완전한 앱 예시

```typescript
import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { auth, requireAuth, requirePermission } from '@vinxen/auth';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(auth(prisma))
  
  // 공개 라우트
  .get('/health', () => ({ status: 'ok' }))
  
  // 인증이 필요한 라우트
  .group('/protected', (app) => 
    app
      .use(requireAuth())
      .get('/profile', ({ user }) => {
        return { message: `Hello, ${user.name}!` };
      })
  )
  
  // 특정 권한이 필요한 라우트
  .group('/admin', (app) =>
    app
      .use(requirePermission(prisma, 'admin:read'))
      .get('/users', async () => {
        const users = await prisma.user.findMany();
        return { users };
      })
  )
  
  .listen(3000);
```

### 권한 부여 예시

```typescript
// 사용자에게 권한 부여
await prisma.permission.create({
  data: {
    name: 'user:read',
    userId: 1
  }
});

// 기본 권한 일괄 부여
import { createBasicPermissions } from '@vinxen/auth';

const permissions = createBasicPermissions('user');
await prisma.permission.createMany({
  data: permissions.map(permission => ({
    name: permission,
    userId: 1
  }))
});
```

## 에러 처리

인증 관련 에러는 표준 HTTP 상태 코드와 함께 반환됩니다:

- `401 Unauthorized` - 인증되지 않은 사용자
- `403 Forbidden` - 권한이 없는 사용자  
- `409 Conflict` - 이미 존재하는 이메일로 회원가입 시도
- `400 Bad Request` - 잘못된 요청 데이터
- `500 Internal Server Error` - 서버 내부 오류

## 보안 고려사항

1. **JWT_SECRET**: 반드시 안전한 랜덤 문자열을 사용하세요
2. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS를 사용하세요
3. **토큰 저장**: 클라이언트에서 토큰을 안전하게 저장하세요 (httpOnly 쿠키 권장)
4. **권한 최소화**: 사용자에게 필요한 최소한의 권한만 부여하세요
5. **토큰 만료**: 적절한 토큰 만료 시간을 설정하세요