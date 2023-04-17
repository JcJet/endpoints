import { Module } from '@nestjs/common';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common';
import { PROFILES_SERVCE } from './constants/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RmqModule.register({
      name: PROFILES_SERVCE,
    }),
  ],
  controllers: [EndpointsController],
  providers: [EndpointsService],
})
export class EndpointsModule {}
