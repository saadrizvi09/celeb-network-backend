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
    // Optional: Listen to Prisma events for logging
    // this.$on('query', (e) => {
    //   console.log('Query: ' + e.query + ' Params: ' + e.params + ' Duration: ' + e.duration + 'ms');
    // });
    // this.$on('info', (e) => {
    //   console.log('Info: ' + e.message);
    // });
    // this.$on('warn', (e) => {
    //   console.log('Warn: ' + e.message);
    // });
    // this.$on('error', (e) => {
    //   console.log('Error: ' + e.message);
    // });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Add a method to enable Prisma shutdown hooks
  // This ensures a clean exit when NestJS shuts down
  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}