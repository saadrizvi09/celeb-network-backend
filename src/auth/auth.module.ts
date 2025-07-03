import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PrismaModule, // Inject PrismaClient
    PassportModule, // For authentication strategies
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to use ConfigService
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from environment variables
        signOptions: { expiresIn: '60m' }, // Token expiration
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // JwtStrategy needs to be a provider
  exports: [AuthService], // Export AuthService if other modules need to use it (e.g., for validation)
})
export class AuthModule {}