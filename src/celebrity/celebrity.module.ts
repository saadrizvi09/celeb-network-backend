
import { Module } from '@nestjs/common';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';
import { PdfModule } from '../pdf/pdf.module';
import { AiModule } from '../ai/ai.module'; 
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PdfModule,
    AiModule, 
  ],
  controllers: [CelebrityController],
  providers: [CelebrityService],
  exports: [CelebrityService] 
})
export class CelebrityModule {}