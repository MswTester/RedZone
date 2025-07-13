/**
 * Converts time strings like '15m', '7d', '1h' to milliseconds
 */
export const parseTimeToMs = (timeStr: string): number => {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Expected format: number + unit (s/m/h/d)`);
  }
  
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!;
  
  switch (unit) {
    case 's': // seconds
      return value * 1000;
    case 'm': // minutes
      return value * 60 * 1000;
    case 'h': // hours
      return value * 60 * 60 * 1000;
    case 'd': // days
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

/**
 * Get access token expiry time in milliseconds
 */
export const getAccessTokenExpiryMs = (): number => {
  const timeStr = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
  return parseTimeToMs(timeStr);
};

/**
 * Get refresh token expiry time in milliseconds
 */
export const getRefreshTokenExpiryMs = (): number => {
  const timeStr = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return parseTimeToMs(timeStr);
};

/**
 * Convert milliseconds to seconds for maxAge cookie setting
 */
export const msToSeconds = (ms: number): number => {
  return Math.floor(ms / 1000);
};