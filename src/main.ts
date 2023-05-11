import { NestFactory } from '@nestjs/core';
import { EndpointsModule } from './endpoints.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

export async function bootstrap() {
  const app = await NestFactory.create(EndpointsModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  await app.listen(configService.get('PORT'));
  return app;
}
bootstrap();
