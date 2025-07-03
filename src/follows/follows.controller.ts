// src/follows/follows.controller.ts
import { Controller, Post, Param, Delete, Get, Req, UseGuards, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { FollowsService } from './follows.service';

// Extend Request to include user property from JwtAuthGuard
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    role: 'fan' | 'celebrity';
    celebrityId?: string;
    celebrityName?: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':celebrityId')
  async followCelebrity(
    @Req() req: AuthenticatedRequest,
    @Param('celebrityId') celebrityId: string,
  ) {
    if (req.user.role !== 'fan') {
      throw new BadRequestException('Only fan users can follow celebrities.');
    }
    try {
      const follow = await this.followsService.followCelebrity(req.user.userId, celebrityId);
      return { message: 'Successfully followed celebrity', follow };
    } catch (error) {
      // Catch specific error message from service for "already following"
      if (error.message === 'You are already following this celebrity.') {
        throw new BadRequestException(error.message); // Use NestJS BadRequestException
      }
      // Catch Prisma's unique constraint violation code (P2002) if it's still thrown
      if (error.code === 'P2002') {
        throw new BadRequestException('You are already following this celebrity.');
      }
      // For any other unexpected errors
      throw new InternalServerErrorException('Failed to follow celebrity.');
    }
  }

  @Delete(':celebrityId')
  async unfollowCelebrity(
    @Req() req: AuthenticatedRequest,
    @Param('celebrityId') celebrityId: string,
  ) {
    if (req.user.role !== 'fan') {
      throw new BadRequestException('Only fan users can unfollow celebrities.');
    }
    try {
      // The service now directly throws NotFoundException if the record isn't found
      // or returns a message on success. No need to check 'result.count'.
      await this.followsService.unfollowCelebrity(req.user.userId, celebrityId);
      return { message: 'Successfully unfollowed celebrity' }; // Return a success message
    } catch (error) {
      // Catch NotFoundException thrown by the service
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException directly
      }
      // For any other unexpected errors
      throw new InternalServerErrorException('Failed to unfollow celebrity.');
    }
  }

  @Get()
  async getFollowedCelebrities(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'fan') {
      throw new BadRequestException('Only fan users can view followed celebrities.');
    }
    try {
      const followedCelebrities = await this.followsService.getFollowedCelebrities(req.user.userId);
      return followedCelebrities;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve followed celebrities.');
    }
  }

  @Get('status/:celebrityId')
  async getFollowStatus(
    @Req() req: AuthenticatedRequest,
    @Param('celebrityId') celebrityId: string,
  ) {
    try {
      const isFollowing = await this.followsService.isFollowing(req.user.userId, celebrityId);
      return { isFollowing };
    } catch (error) {
      throw new InternalServerErrorException('Failed to check follow status.');
    }
  }
}