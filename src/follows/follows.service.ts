// src/follows/follows.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async followCelebrity(userId: string, celebrityId: string) {
    const celebrity = await this.prisma.celebrity.findUnique({
      where: { id: celebrityId },
    });
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID ${celebrityId} not found.`);
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });

    if (existingFollow) {
      throw new Error('You are already following this celebrity.');
    }

    return this.prisma.follow.create({
      data: {
        userId,
        celebrityId,
      },
      include: {
        celebrity: true,
      },
    });
  }

  async unfollowCelebrity(userId: string, celebrityId: string) {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('Follow record not found or you are not following this celebrity.');
    }

    await this.prisma.follow.delete({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });
    return { message: 'Successfully unfollowed' }; 
  }

  async getFollowedCelebrities(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { userId },
      include: {
        celebrity: true,
      },
    });

    return follows
      .filter(follow => follow.celebrity !== null) 
      .map(follow => follow.celebrity);
  }

  async isFollowing(userId: string, celebrityId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });
    return !!follow;
  }
}