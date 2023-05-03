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
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  COMMENTS_SERVICE,
  FILES_SERVICE,
  PROFILES_SERVICE,
} from './constants/services';
import { ProfileDto } from './dto/profile.dto';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentaryDto } from './dto/getCommentary.dto';
import { FileDto } from './dto/file.dto';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { EndpointsService } from './endpoints.service';
import { Request, Response } from 'express';

@Controller('api')
export class EndpointsController {
  constructor(
    @Inject(PROFILES_SERVICE) private profilesClient: ClientProxy,
    @Inject(COMMENTS_SERVICE) private commentsClient: ClientProxy,
    @Inject(FILES_SERVICE) private filesClient: ClientProxy,
    private readonly endpointsService: EndpointsService,
  ) {}

  // Эндпоинт для регистрации нового пользователя
  @Post('/registration')
  async registration(
    @Body() profileDto: ProfileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const profileData = await lastValueFrom(
      this.profilesClient.send('registration', { dto: profileDto }),
    );
    res.cookie('refreshToken', profileData.tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return profileData;
  }

  // Эндпоинт для входа в уже созданную учетную запись
  @Post('/login')
  async login(
    @Body() profileDto: ProfileDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const profileData = await lastValueFrom(
      this.profilesClient.send('login', { dto: profileDto }),
    );
    res.cookie('refreshToken', profileData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return profileData;
  }
  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken } = req.cookies;
    const profileData = await lastValueFrom(
      this.profilesClient.send('logout', { refreshToken }),
    );
    res.clearCookie('refreshToken');
    return profileData;
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken } = req.cookies;
    const profileData = await lastValueFrom(
      this.profilesClient.send('refresh', { refreshToken }),
    );
    res.cookie('refreshToken', profileData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return profileData;
  }
  @Get('/activate/:link')
  async activate(
    @Param('link') activationLink: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.profilesClient.send('activate', { activationLink })
    return res.redirect(process.env.CLIENT_URL);
  }

  // Эндпоинт для получения всех пользователей
  @Get('/profiles')
  async getAllUsers(): Promise<ProfileDto[]> {
    return await lastValueFrom(
      this.profilesClient.send('get_all_profiles', {}),
    );
  }

  // Эндпоинт для изменения данных пользователя по id
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/profiles/:id')
  async update(
    @Param('id') id: number,
    @Body() profileDto: ProfileDto,
    @UploadedFile() avatar = undefined,
  ): Promise<ProfileDto> {
    return await this.endpointsService.updateProfile(id, profileDto, avatar);
  }

  @Delete('/profiles/:id')
  async delete(@Param('id') id: number): Promise<ProfileDto> {
    return await lastValueFrom(
      this.profilesClient.send('delete_profile', { id }),
    );
  }

  @Get('/profiles/:id')
  async getProfileById(@Param('id') id: number): Promise<ProfileDto> {
    return await lastValueFrom(
      this.profilesClient.send('get_profile_by_id', { id }),
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

  // Эндпоинты для работы с файлами
  @UseInterceptors(FileInterceptor('file'))
  @Post('/files')
  async create_file(
    @Body() dto: FileDto,
    @UploadedFile() file = undefined,
  ): Promise<FileDto> {
    return await lastValueFrom(
      this.filesClient.send('create_file', { file, dto }),
    );
  }

  @Get('/files/')
  async get_files(
    @Query('essenceTable') essenceTable: string,
    @Query('essenceId') essenceId: number,
  ): Promise<FileDto> {
    const dto: FileDto = { essenceTable, essenceId };
    return await lastValueFrom(
      this.filesClient.send('get_files', {
        dto,
      }),
    );
  }

  @Delete('/files/')
  async delete_files(
    @Query('essenceTable') essenceTable: string,
    @Query('essenceId') essenceId: number,
  ): Promise<any> {
    const dto: FileDto = { essenceTable, essenceId };
    return await lastValueFrom(
      this.filesClient.send('delete_files', {
        dto,
      }),
    );
  }
  @Delete('/files/:fileName')
  async delete_file(@Param('fileName') fileName: string): Promise<any> {
    return await lastValueFrom(
      this.filesClient.send('delete_file_by_name', {
        fileName,
      }),
    );
  }
}
