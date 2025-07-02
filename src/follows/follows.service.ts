// src/follows/follows.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async followCelebrity(userId: string, celebrityId: string) {
    // Check if the celebrity exists
    const celebrity = await this.prisma.celebrity.findUnique({
      where: { id: celebrityId },
    });
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID ${celebrityId} not found.`);
    }

    // Check if the user is already following this celebrity
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });

    if (existingFollow) {
      // Return a specific message if already following
      throw new Error('You are already following this celebrity.');
    }

    return this.prisma.follow.create({
      data: {
        userId,
        celebrityId,
      },
      // IMPORTANT: Include the celebrity data when a new follow is created
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
      throw new NotFoundException('Not following this celebrity.');
    }

    await this.prisma.follow.delete({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });
    return { message: 'Unfollowed successfully' };
  }

  async getFollowedCelebrities(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { userId },
      // CRITICAL FIX: Explicitly include the related Celebrity data
      include: {
        celebrity: true,
      },
    });

    // Filter out any follow records where the celebrity might be null (e.g., if database integrity issue somehow occurs)
    // Then map to return only the celebrity objects
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