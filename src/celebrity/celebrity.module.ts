// src/celebrity/celebrity.module.ts
import { Module } from '@nestjs/common';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';

@Module({
  // REMOVE THIS:
  // imports: [TypeOrmModule.forFeature([Celebrity])],
  controllers: [CelebrityController],
  providers: [CelebrityService], // PrismaService is globally provided by PrismaModule
})
export class CelebrityModule {}