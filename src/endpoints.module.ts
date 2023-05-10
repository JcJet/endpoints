import { Module } from '@nestjs/common';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/common';
import { COMMENTS_SERVICE, FILES_SERVICE, PROFILES_SERVICE, ROLES_SERVICE } from "./constants/services";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RmqModule.register({
      name: PROFILES_SERVICE,
    }),
    RmqModule.register({
      name: COMMENTS_SERVICE,
    }),
    RmqModule.register({
      name: FILES_SERVICE,
    }),
    RmqModule.register({
      name: ROLES_SERVICE,
    }),
  ],
  controllers: [EndpointsController],
  providers: [EndpointsService],
})
export class EndpointsModule {}
