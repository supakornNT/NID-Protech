import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { AppModule } from './app.module';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useStaticAssets(resolve(process.cwd(), '..', 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
