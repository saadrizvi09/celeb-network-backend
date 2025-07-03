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
       
      },
    });

    
    const role: 'fan' | 'celebrity' = 'fan'; 

    const payload = {
      userId: user.id,
      username: user.username,
      role: role, 
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async signIn(authDto: AuthDto): Promise<{ accessToken: string }> {
    const { username, password } = authDto;

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        celebrityProfile: { 
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

    const role: 'fan' | 'celebrity' = user.celebrityProfile ? 'celebrity' : 'fan';

    const payload = {
      userId: user.id,
      username: user.username,
      role: role, 
      ...(user.celebrityProfile && {
        celebrityId: user.celebrityProfile.id,
        celebrityName: user.celebrityProfile.name,
      }),
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}