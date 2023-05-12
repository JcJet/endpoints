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
import { ProfileDto } from './dto/profile.dto';
import { CommentaryDto } from './dto/commentary.dto';
import { GetCommentaryDto } from './dto/getCommentary.dto';
import { FileDto } from './dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { EndpointsService } from './endpoints.service';
import { Request, Response } from 'express';
import { RoleDto } from './dto/role.dto';
import { UpdateUserRoleDto } from './dto/updateUserRole.dto';

@Controller('api')
export class EndpointsController {
  constructor(
    @Inject('TO_PROFILES_MS') private toProfilesProxy: ClientProxy,
    @Inject('TO_COMMENTS_MS') private toCommentsProxy: ClientProxy,
    @Inject('TO_FILES_MS') private toFilesProxy: ClientProxy,
    @Inject('TO_ROLES_MS') private toRolesProxy: ClientProxy,
    private readonly endpointsService: EndpointsService,
  ) {}

  // Эндпоинт для регистрации нового пользователя
  @Post('/registration')
  async registration(
    @Body() profileDto: ProfileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const profileData = await lastValueFrom(
      this.toProfilesProxy.send('registration', { dto: profileDto }),
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
      this.toProfilesProxy.send('login', { dto: profileDto }),
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
      this.toProfilesProxy.send('logout', { refreshToken }),
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
      this.toProfilesProxy.send('refresh', { refreshToken }),
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
    await this.toProfilesProxy.send('activate', { activationLink });
    return res.redirect(process.env.CLIENT_URL);
  }

  // Эндпоинт для получения всех пользователей
  @Get('/profiles')
  async getAllUsers(): Promise<ProfileDto[]> {
    return await lastValueFrom(this.toProfilesProxy.send('getAllProfiles', {}));
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
      this.toProfilesProxy.send('deleteProfile', { id }),
    );
  }

  @Get('/profiles/:id')
  async getProfileById(@Param('id') id: number): Promise<ProfileDto> {
    return await lastValueFrom(
      this.toProfilesProxy.send('getProfileById', { id }),
    );
  }

  // Эндпоинты комментария
  @Post('/comments')
  async create_comment(@Body() dto: CommentaryDto): Promise<CommentaryDto> {
    return await lastValueFrom(
      this.toCommentsProxy.send('createComment', { dto }),
    );
  }

  @Get('/comments/')
  async get_comments(
    @Query('essenceTable') essenceTable: string,
    @Query('essenceId') essenceId: number,
    @Query('nestedComments') nestedComments: boolean,
  ): Promise<CommentaryDto> {
    const dto: GetCommentaryDto = { essenceTable, essenceId };
    const pattern: string = nestedComments ? 'getCommentsTree' : 'getComments';
    return await lastValueFrom(
      this.toCommentsProxy.send(pattern, {
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
      this.toCommentsProxy.send('editComment', { id, dto }),
    );
  }

  @Delete('/comments/:id')
  async delete_comment(@Param('id') id: number): Promise<CommentaryDto> {
    return await lastValueFrom(
      this.toCommentsProxy.send('deleteComment', { id }),
    );
  }
  @Delete('/comments/')
  async deleteCommentsFromEssence(
    @Query('essenceTable') essenceTable: string,
    @Query('essenceId') essenceId: number,
  ) {
    const dto: { essenceId: number; essenceTable: string } = {
      essenceTable,
      essenceId,
    };
    return await lastValueFrom(
      this.toCommentsProxy.send('deleteCommentsFromEssence', {
        dto,
      }),
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
      this.toFilesProxy.send('createFile', { file, dto }),
    );
  }

  @Get('/files/')
  async get_files(
    @Query('essenceTable') essenceTable: string,
    @Query('essenceId') essenceId: number,
  ): Promise<FileDto> {
    const dto: FileDto = { essenceTable, essenceId };
    return await lastValueFrom(
      this.toFilesProxy.send('getFiles', {
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
      this.toFilesProxy.send('deleteFiles', {
        dto,
      }),
    );
  }
  @Delete('/files/:fileName')
  async delete_file(@Param('fileName') fileName: string): Promise<any> {
    return await lastValueFrom(
      this.toFilesProxy.send('deleteFileByName', {
        fileName,
      }),
    );
  }

  // Эндпоинты ролей
  @Post('/roles/')
  async createRole(@Body() dto: RoleDto) {
    return await lastValueFrom(this.toRolesProxy.send('createRole', { dto }));
  }
  @Get('/roles/')
  async getAllRoles() {
    return await lastValueFrom(this.toRolesProxy.send('getAllRoles', {}));
  }
  @Get('/roles/:id')
  async getRoleById(@Param('id') id: number) {
    return await lastValueFrom(this.toRolesProxy.send('getRoleById', { id }));
  }
  @Put('/roles/:id')
  async updateRole(@Body() dto: RoleDto, @Param('id') id: number) {
    return await lastValueFrom(
      this.toRolesProxy.send('updateRole', { id, dto }),
    );
  }
  @Delete('/roles/:value')
  async deleteRoleByValue(@Param('value') value: string) {
    return await lastValueFrom(
      this.toRolesProxy.send('deleteRoleByValue', { value }),
    );
  }
  @Post('/roles/user/:userId')
  async addUserRoles(@Body() roles: string[], @Param('userId') userId: number) {
    return await lastValueFrom(
      this.toRolesProxy.send('addUserRoles', { dto: { roles, userId } }),
    );
  }
  @Delete('/roles/user/:userId')
  async deleteUserRoles(
    @Body() roles: string[],
    @Param('userId') userId: number,
  ) {
    return await lastValueFrom(
      this.toRolesProxy.send('deleteUserRoles', { dto: { roles, userId } }),
    );
  }
  @Get('/roles/user/:userId')
  async getUserRoles(@Param('userId') userId: number) {
    return await lastValueFrom(
      this.toRolesProxy.send('getUserRoles', { userId }),
    );
  }
}
