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

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const accessToken = this.jwtService.sign({ userId: user.id, username: user.username });
    return { accessToken };
  }

  async signIn(authDto: AuthDto): Promise<{ accessToken: string }> {
    const { username, password } = authDto;

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ userId: user.id, username: user.username });
    return { accessToken };
  }

  // Method to validate user from JWT payload (used by JwtStrategy)
  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}