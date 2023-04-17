import { NestFactory } from '@nestjs/core';
import { EndpointsModule } from './endpoints.module';
import { ConfigService } from '@nestjs/config';

export async function bootstrap() {
  const app = await NestFactory.create(EndpointsModule);
  //const rmqService = app.get<RmqService>(RmqService);
  //app.connectMicroservice(rmqService.getOptions('HUB', true));
  const configService = app.get(ConfigService);
  //await app.startAllMicroservices()
  await app.listen(configService.get('PORT'));
  return app;
}
bootstrap();
