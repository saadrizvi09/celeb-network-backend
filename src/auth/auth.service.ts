// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from './auth.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(authDto: AuthDto): Promise<{ accessToken: string }> {
    const { username, password } = authDto;

    const existingUser = await this.prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        // No 'role' field in Prisma User model, so we don't set it here.
        // Role will be determined by linked celebrity profile or default to 'fan'.
      },
    });

    // For new sign-ups without a linked celebrity profile yet, default to 'fan' role.
    // The celebrityProfile will be null here.
    const role: 'fan' | 'celebrity' = 'fan'; // Default role for new sign-ups

    const payload = {
      userId: user.id,
      username: user.username,
      role: role, // Embed the default role in the JWT
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async signIn(authDto: AuthDto): Promise<{ accessToken: string }> {
    const { username, password } = authDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        celebrityProfile: { // Include the celebrity profile to determine role
          select: { id: true, name: true }
        }
      }
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Determine role based on whether a celebrity profile is linked
    const role: 'fan' | 'celebrity' = user.celebrityProfile ? 'celebrity' : 'fan';

    const payload = {
      userId: user.id,
      username: user.username,
      role: role, // Embed the determined role in the JWT
      // If the user is a celebrity, include their celebrityId and name in the token
      ...(user.celebrityProfile && {
        celebrityId: user.celebrityProfile.id,
        celebrityName: user.celebrityProfile.name,
      }),
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  // Method to validate user from JWT payload (used by JwtStrategy)
  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}