/**
 * Environment configuration validation and typing.
 *
 * Uses a plain validation function (no external deps like Joi)
 * to validate required environment variables at startup,
 * failing fast if any are missing or invalid.
 */

interface EnvironmentVariables {
  // Server
  PORT: number;
  NODE_ENV: string;

  // Database
  DATABASE_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRATION: string;

  // OpenAI
  OPENAI_API_KEY: string;

  // File Upload
  UPLOAD_DIR: string;
  MAX_FILE_SIZE_MB: number;

  // CORS
  CORS_ORIGIN: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

  const missing = requiredVars.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Please check your .env file.',
    );
  }

  // Validate JWT_SECRET is not the default placeholder
  if (config.JWT_SECRET === 'CHANGE_ME_TO_A_STRONG_RANDOM_SECRET') {
    throw new Error(
      'JWT_SECRET must be changed from the default placeholder. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"',
    );
  }

  // Validate JWT_SECRET minimum length for security
  if (typeof config.JWT_SECRET === 'string' && config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for adequate security.');
  }

  return {
    PORT: parseInt(config.PORT as string, 10) || 3001,
    NODE_ENV: (config.NODE_ENV as string) || 'development',
    DATABASE_URL: config.DATABASE_URL as string,
    JWT_SECRET: config.JWT_SECRET as string,
    JWT_EXPIRATION: (config.JWT_EXPIRATION as string) || '24h',
    OPENAI_API_KEY: (config.OPENAI_API_KEY as string) || '',
    UPLOAD_DIR: (config.UPLOAD_DIR as string) || './uploads',
    MAX_FILE_SIZE_MB: parseInt(config.MAX_FILE_SIZE_MB as string, 10) || 50,
    CORS_ORIGIN: (config.CORS_ORIGIN as string) || 'http://localhost:3000',
  };
}
