export function validate(config: Record<string, any>): Record<string, any> {
  const env = process.env;
  const errors: string[] = [];

  // Database: either DATABASE_URL, or individual credentials
  if (!env.DATABASE_URL) {
    if (!env.DB_USER && !env.DB_USERNAME) {
      errors.push('Missing required environment variable: DB_USER (or DB_USERNAME)');
    }
    if (!env.DB_PASSWORD) {
      errors.push('Missing required environment variable: DB_PASSWORD');
    }
    if (!env.DB_NAME && !env.DB_DATABASE) {
      errors.push('Missing required environment variable: DB_NAME (or DB_DATABASE)');
    }
  }

  if (!env.JWT_ACCESS_SECRET) {
    errors.push('Missing required environment variable: JWT_ACCESS_SECRET');
  }
  if (!env.GOOGLE_CLIENT_ID) {
    errors.push('Missing required environment variable: GOOGLE_CLIENT_ID');
  }

  if (env.NODE_ENV === 'production' && !env.CORS_ORIGINS) {
    errors.push('CORS_ORIGINS must be set in production (no localhost fallback allowed)');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return config;
}
