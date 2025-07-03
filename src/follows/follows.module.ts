import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from 'prisma/prisma.service';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';

@Module({
  imports: [AuthModule],
  controllers: [FollowsController],
  providers: [FollowsService, PrismaService],
})
export class FollowsModule {}