// Main auth module
export { default as auth } from './index';

// Utility exports
export { hashPassword, verifyPassword, generateTokens, validateEmail, validatePassword } from './utils';
export { parseTimeToMs, getAccessTokenExpiryMs, getRefreshTokenExpiryMs, msToSeconds } from './time-utils';

// Response utilities
export { createSuccessResponse, createErrorResponse, responses } from './responses';

// Middleware exports
export {
  requireAuth,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireResourcePermission,
  requireOwnership,
  requirePermissionOrOwnership
} from './middleware';

// Permission utilities
export {
  ACTIONS,
  createBasicPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  createPermission,
  parsePermission,
  hasResourcePermission,
  addPermission,
  removePermission,
  addPermissions,
  removePermissions,
  isValidPermission,
  normalizePermission,
  normalizePermissions
} from './permissions';

// Re-export all types and schemas from shared
export * from './types';

// Permission types
export type { Action, Permission } from './permissions';