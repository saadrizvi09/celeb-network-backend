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
      if (error.code === 'P2002') {
        throw new BadRequestException('You are already following this celebrity.');
      }
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
      const result = await this.followsService.unfollowCelebrity(req.user.userId, celebrityId);
      if (result.count === 0) {
        throw new NotFoundException('Follow record not found or you are not following this celebrity.');
      }
      return { message: 'Successfully unfollowed celebrity' };
    } catch (error) {
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