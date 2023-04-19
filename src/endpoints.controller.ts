import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { COMMENTS_SERVICE, PROFILES_SERVICE } from './constants/services';
import { ProfileDto } from './dto/profile.dto';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentaryDto } from './dto/getCommentary.dto';

@Controller('api')
export class EndpointsController {
  constructor(
    @Inject(PROFILES_SERVICE) private profilesClient: ClientProxy,
    @Inject(COMMENTS_SERVICE) private commentsClient: ClientProxy,
  ) {}

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

  // Эндпоинты комментария
  // TODO: контроль доступа: только свои или админ
  // TODO: id пользователя = текущий
  @Post('/comments')
  async create_comment(@Body() dto: CommentaryDto): Promise<CommentaryDto> {
    return await lastValueFrom(
      this.commentsClient.send('create_comment', { dto }),
    );
  }

  @Get('/comments/')
  async get_comments(
    @Query('essenceTable') essenceTable: string,
    @Query('essenceId') essenceId: number,
  ): Promise<CommentaryDto> {
    const dto: GetCommentaryDto = { essenceTable, essenceId };
    return await lastValueFrom(
      this.commentsClient.send('get_comments', {
        dto,
      }),
    );
  }

  @Put('/comments/:id')
  async edit_comment(
    @Param('id') id: number,
    @Body() dto: CommentaryDto,
  ): Promise<CommentaryDto> {
    return await lastValueFrom(
      this.commentsClient.send('edit_comment', { id, dto }),
    );
  }

  @Delete('/comments/:id')
  async delete_comment(@Param('id') id: number): Promise<CommentaryDto> {
    return await lastValueFrom(
      this.commentsClient.send('delete_comment', { id }),
    );
  }
}
