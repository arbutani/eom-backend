require('dotenv').config({ path: '.env', quiet: true });

const base = {
  dialect: 'postgres',
  dialectOptions: {
    connectionTimeoutMillis: 30000,
    ...(process.env.DB_SSL === 'true'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}),
  },
};

const shared = process.env.DATABASE_URL
  ? { ...base, use_env_variable: 'DATABASE_URL' }
  : {
      ...base,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || process.env.DB_DATABASE || 'google',
    };

module.exports = {
  development: shared,
  production: shared,
  test: shared,
};
