// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller'; // <-- Make sure this is imported

@Module({
  imports: [ConfigModule],
  providers: [AiService],
  controllers: [AiController], // <-- THIS IS CRUCIAL: Ensure AiController is here
  exports: [AiService],
})
export class AiModule {}