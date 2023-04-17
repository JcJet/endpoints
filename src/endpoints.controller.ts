import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PROFILES_SERVCE } from './constants/services';
import { ProfileDto } from './dto/profile.dto';

@Controller('api')
export class EndpointsController {
  constructor(@Inject(PROFILES_SERVCE) private profilesClient: ClientProxy) {}

  // Эндпоинт для регистрации нового пользователя
  // TODO: avatars?
  @Post('/registration')
  async registration(@Body() profileDto: ProfileDto): Promise<ProfileDto> {
    return await lastValueFrom(
      this.profilesClient.send('registration', { dto: profileDto }),
    );
  }

  // Эндпоинт для входа в уже созданную учетную запись
  @Post('/login')
  async login(@Body() profileDto: ProfileDto): Promise<ProfileDto> {
    return await lastValueFrom(
      this.profilesClient.send('login', { dto: profileDto }),
    );
  }

  // Эндпоинт для получения всех пользователей
  @Get('/profiles')
  async getAllUsers(): Promise<ProfileDto[]> {
    return await lastValueFrom(
      this.profilesClient.send('get_all_profiles', {}),
    );
  }

  // Эндпоинт для изменения данных пользователя по id
  @Put('/profiles/:id')
  async update(
    @Param('id') id: number,
    @Body() profileDto: ProfileDto,
  ): Promise<ProfileDto> {
    return await lastValueFrom(
      this.profilesClient.send('update_profile', { id, dto: profileDto }),
    );
  }

  @Delete('/profiles/:id')
  async delete(@Param('id') id: number): Promise<ProfileDto> {
    return await lastValueFrom(
      this.profilesClient.send('delete_profile', { id }),
    );
  }
}
