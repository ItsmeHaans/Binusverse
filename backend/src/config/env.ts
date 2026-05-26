import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES: process.env['JWT_ACCESS_EXPIRES'] ?? '15m',
  JWT_REFRESH_EXPIRES: process.env['JWT_REFRESH_EXPIRES'] ?? '7d',
  PORT: parseInt(process.env['PORT'] ?? '3000', 10),
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:5500',
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
};
