import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from '../service/redis.service';
import { parseRedisUrl } from '../../database/database.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL')!;
        const { host, port, password } = parseRedisUrl(redisUrl);

        const finalPassword =
          password && password.trim().length > 0 ? password : undefined;

        const isProd = configService.get<string>('NODE_ENV') === 'production';

        const client = new Redis({
          host,
          port,
          password: finalPassword,
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
          ...(isProd && {
            tls: {
              rejectUnauthorized: false,
            },
          }),
        });

        client.on('connect', () =>
          console.log(`\u2705 Redis connected to ${host}:${port}`),
        );

        client.on('ready', () => console.log('\uD83D\uDE80 Redis ready'));

        client.on('error', (err) =>
          console.error('\u274C Redis error:', err.message),
        );

        client.on('reconnecting', () =>
          console.log('\uD83D\uDD04 Redis reconnecting...'),
        );

        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
