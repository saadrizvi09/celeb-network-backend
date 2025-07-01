import { Module } from '@nestjs/common';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';
import { PrismaModule } from 'prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';

@Module({
   imports: [PrismaModule, PdfModule], 

  controllers: [CelebrityController],
  providers: [CelebrityService], 
})
export class CelebrityModule {}