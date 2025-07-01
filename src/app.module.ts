import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CelebrityModule } from './celebrity/celebrity.module';
import { AiModule } from './ai/ai.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
   
    PrismaModule,
    CelebrityModule,
    AiModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}