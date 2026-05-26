import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

import { AppModule } from './app.module';
import { redisClient } from './config/redis.config';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function bootstrap() {
  let redisEnabled = false;

  try {
    await redisClient.connect();
    redisEnabled = true;
  } catch (error) {
    console.warn(
      'Redis connection failed. Using in-memory session store instead.',
      error,
    );
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(resolve(process.cwd(), '..', 'uploads'), {
    prefix: '/uploads',
  });

  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'my-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  };

  if (redisEnabled) {
    sessionConfig.store = new RedisStore({
      client: redisClient,
    });
  }

  app.use(session(sessionConfig));

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
