// src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

 
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}