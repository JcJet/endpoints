import { Inject, Injectable } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { FileDto } from './dto/file.dto';

@Injectable()
export class EndpointsService {
  constructor(
    @Inject('TO_PROFILES_MS') private toProfilesProxy: ClientProxy,
    @Inject('TO_COMMENTS_MS') private toCommentsProxy: ClientProxy,
    @Inject('TO_FILES_MS') private toFilesProxy: ClientProxy,
  ) {}
  async updateProfile(id: number, dto: ProfileDto, avatar) {
    let avatarFileName = '';
    if (avatar) {
      const fileDto: FileDto = { essenceTable: 'Profiles', essenceId: id };
      await lastValueFrom(
        this.toFilesProxy.send('deleteFiles', { dto: fileDto }),
      );
      avatarFileName = await lastValueFrom(
        this.toFilesProxy.send('createFile', { file: avatar, dto: fileDto }),
      );
    }
    return await lastValueFrom(
      this.toProfilesProxy.send('updateProfile', { id, dto, avatarFileName }),
    );
  }
}
