import { Injectable } from '@nestjs/common';

@Injectable()
export class EndpointsService {
  getHello(): string {
    return 'Hello World!';
  }
}
