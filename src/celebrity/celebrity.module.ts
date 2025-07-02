// src/celebrity/celebrity.module.ts
import { Module } from '@nestjs/common';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';
import { PdfModule } from '../pdf/pdf.module'; // Ensure this path is correct if not already
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule, PdfModule],
  controllers: [CelebrityController],
  providers: [CelebrityService],
  exports: [CelebrityService] // IMPORTANT: Export CelebrityService if other modules need to inject it
})
export class CelebrityModule {}