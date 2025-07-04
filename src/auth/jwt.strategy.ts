// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, 
    });
  }

  async validate(payload: {
    userId: string;
    username: string;
    role: 'fan' | 'celebrity';
    celebrityId?: string;
    celebrityName?: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      username: user.username,
      role: payload.role,
      celebrityId: payload.celebrityId,
      celebrityName: payload.celebrityName,
    };
  }
}