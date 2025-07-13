// 기본 액션 상수
export const ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  PATCH: 'patch'
} as const;

// 권한 타입 정의
export type Action = typeof ACTIONS[keyof typeof ACTIONS];
export type Permission = string; // 'resource:action' 형태

// 기본 권한 생성 함수
export const createBasicPermissions = (resource: string): Permission[] => {
  return Object.values(ACTIONS).map(action => createPermission(resource, action));
};

// 기본 권한 설정
export const DEFAULT_USER_PERMISSIONS: Permission[] = [];

// 권한 검증 헬퍼 함수들
export const hasPermission = (userPermissions: string[], required: string): boolean => {
  return userPermissions.includes(required);
};

export const hasAnyPermission = (userPermissions: string[], required: string[]): boolean => {
  return required.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], required: string[]): boolean => {
  return required.every(permission => userPermissions.includes(permission));
};

// 권한 문자열 생성 헬퍼
export const createPermission = (resource: string, action: string): string => {
  return `${resource}:${action}`;
};

// 권한 파싱 헬퍼
export const parsePermission = (permission: string): { resource: string; action: string } => {
  const [resource, action] = permission.split(':');
  return { resource: resource || '', action: action || '' };
};

// 리소스별 권한 체크
export const hasResourcePermission = (
  userPermissions: string[], 
  resource: string, 
  action: string
): boolean => {
  const permission = createPermission(resource, action);
  return hasPermission(userPermissions, permission);
};

// 권한 추가/제거 헬퍼
export const addPermission = (userPermissions: string[], permission: string): string[] => {
  if (hasPermission(userPermissions, permission)) {
    return userPermissions;
  }
  return [...userPermissions, permission];
};

export const removePermission = (userPermissions: string[], permission: string): string[] => {
  return userPermissions.filter(p => p !== permission);
};

// 권한 세트 관리
export const addPermissions = (userPermissions: string[], permissions: string[]): string[] => {
  const newPermissions = [...userPermissions];
  permissions.forEach(permission => {
    if (!hasPermission(newPermissions, permission)) {
      newPermissions.push(permission);
    }
  });
  return newPermissions;
};

export const removePermissions = (userPermissions: string[], permissions: string[]): string[] => {
  return userPermissions.filter(p => !permissions.includes(p));
};

// 권한 유효성 검증
export const isValidPermission = (permission: string): boolean => {
  const { resource, action } = parsePermission(permission);
  return resource.length > 0 && action.length > 0;
};

// 권한 정규화 (소문자로 변환)
export const normalizePermission = (permission: string): string => {
  return permission.toLowerCase();
};

// 권한 목록 정규화
export const normalizePermissions = (permissions: string[]): string[] => {
  return permissions.map(normalizePermission);
};