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
      // IMPORTANT: Throw a generic Error with a specific message for the controller to catch
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
      // IMPORTANT: Throw NestJS NotFoundException if record doesn't exist
      throw new NotFoundException('Follow record not found or you are not following this celebrity.');
    }

    // Use deleteMany to ensure a count is returned, or just delete and handle the throw
    // For simplicity and alignment with the controller's expectation (no count check),
    // we'll just delete and let the NotFoundException handle the case where it doesn't exist.
    await this.prisma.follow.delete({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });
    return { message: 'Successfully unfollowed' }; // Return a success message
  }

  async getFollowedCelebrities(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { userId },
      include: {
        celebrity: true,
      },
    });

    return follows
      .filter(follow => follow.celebrity !== null) // Filter out any null celebrity relations
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