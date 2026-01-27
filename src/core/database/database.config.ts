import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const databaseValidationSchema = Joi.object({
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  DB_TYPE: Joi.string().valid('mysql', 'postgres', 'mongodb').required(),
  DB_NAME: Joi.string().required(),
  DB_NAME_DEV: Joi.string().required(),
  DB_HOST: Joi.string().required(), // docker service name is valid
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  RABBITMQ_HOST: Joi.string().required(),
  RABBITMQ_PORT: Joi.number().default(5672),
  RABBITMQ_USER: Joi.string().required(),
  RABBITMQ_PASSWORD: Joi.string().required(),

  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),

  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
});

export default registerAs('database', () => {
  const env = process.env.NODE_ENV || 'development';
  const dbName =
    env === 'production' ? process.env.DB_NAME : process.env.DB_NAME_DEV;

  return {
    type: process.env.DB_TYPE as 'mysql' | 'postgres' | 'mongodb',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
    synchronize: true,
    logging: env !== 'production',
    autoLoadEntities: true,
    migrations: ['dist/core/database/migrations/*{.ts,.js}'],
  };
});
