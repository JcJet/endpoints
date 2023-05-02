import { Inject, Injectable } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { lastValueFrom } from 'rxjs';
import {
  COMMENTS_SERVICE,
  FILES_SERVICE,
  PROFILES_SERVICE,
} from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { FileDto } from './dto/file.dto';

@Injectable()
export class EndpointsService {
  constructor(
    @Inject(PROFILES_SERVICE) private profilesClient: ClientProxy,
    @Inject(COMMENTS_SERVICE) private commentsClient: ClientProxy,
    @Inject(FILES_SERVICE) private filesClient: ClientProxy,
  ) {}
  async updateProfile(id: number, dto: ProfileDto, avatar) {
    let avatarFileName = '';
    if (avatar) {
      const fileDto: FileDto = { essenceTable: 'Profiles', essenceId: id };
      await lastValueFrom(
        this.filesClient.send('delete_files', { dto: fileDto }),
      );
      avatarFileName = await lastValueFrom(
        this.filesClient.send('create_file', { file: avatar, dto: fileDto }),
      );
    }
    return await lastValueFrom(
      this.profilesClient.send('update_profile', { id, dto, avatarFileName }),
    );
  }
}
