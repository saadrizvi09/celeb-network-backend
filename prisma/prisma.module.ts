// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available everywhere without re-importing
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService so other modules can use it
})
export class PrismaModule {}