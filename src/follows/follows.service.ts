// src/follows/follows.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async followCelebrity(userId: string, celebrityId: string) {
    const celebrity = await this.prisma.celebrity.findUnique({
      where: { id: celebrityId },
    });

    if (!celebrity) {
      throw new Error('Celebrity not found.');
    }

    return this.prisma.follow.create({
      data: {
        userId,
        celebrityId,
      },
    });
  }

  async unfollowCelebrity(userId: string, celebrityId: string) {
    return this.prisma.follow.deleteMany({
      where: {
        userId,
        celebrityId,
      },
    });
  }

  async getFollowedCelebrities(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { userId },
      include: {
        celebrity: { // Include the full celebrity object
          select: {
            id: true,
            name: true,
            country: true,
            profileImageUrl: true,
            youtubeChannel: true,
            spotifyId: true,
            imdbId: true,
            fanbaseCount: true,
            sampleSetlistOrKeynoteTopics: true,
            createdAt: true,
            updatedAt: true,
            description: true,
            instagramHandle: true,
            category: true,
          },
        },
      },
    });
    // Filter out any follow records where the celebrity might be null or undefined
    // This happens if a follow record exists but the corresponding celebrity record has been deleted.
    return follows
      .filter(follow => follow.celebrity !== null && follow.celebrity !== undefined)
      .map((follow) => follow.celebrity);
  }

  async isFollowing(userId: string, celebrityId: string): Promise<boolean> {
    const followRecord = await this.prisma.follow.findUnique({
      where: {
        userId_celebrityId: {
          userId,
          celebrityId,
        },
      },
    });
    return !!followRecord;
  }
}