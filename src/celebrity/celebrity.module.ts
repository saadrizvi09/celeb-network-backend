// src/celebrity/celebrity.module.ts
import { Module } from '@nestjs/common';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';
import { PdfModule } from '../pdf/pdf.module';
import { AiModule } from '../ai/ai.module'; // IMPORTANT: Import AiModule
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PdfModule,
    AiModule, // IMPORTANT: Add AiModule here to make AiService available
  ],
  controllers: [CelebrityController],
  providers: [CelebrityService],
  exports: [CelebrityService] // IMPORTANT: Export CelebrityService if other modules need to inject it
})
export class CelebrityModule {}