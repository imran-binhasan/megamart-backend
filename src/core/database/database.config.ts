import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { URL } from 'url';

export const databaseValidationSchema = Joi.object({
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  RABBITMQ_URL: Joi.string().required(),

  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),

  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
});

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    type: parsed.protocol.slice(0, -1),
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
  } as {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

export function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
  };
}

export function parseRabbitMqUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 5672,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}

export default registerAs('database', () => {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL!);

  return {
    type: dbConfig.type as 'mysql' | 'postgres' | 'mongodb',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: true,
    logging: env !== 'production',
    autoLoadEntities: true,
    migrations: ['dist/core/database/migrations/*{.ts,.js}'],
  };
});
