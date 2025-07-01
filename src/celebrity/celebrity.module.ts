import { Module } from '@nestjs/common';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';

@Module({
 
  controllers: [CelebrityController],
  providers: [CelebrityService], 
})
export class CelebrityModule {}