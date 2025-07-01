// src/celebrity/celebrity.service.ts (ensure it matches previous example)
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto'; // <-- IMPORT UpdateCelebrityDto
import { Celebrity as PrismaCelebrityModel } from '@prisma/client'; // <-- IMPORT Prisma's generated type
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CelebrityService {
  constructor(private prisma: PrismaService) {}

  async create(createCelebrityDto: CreateCelebrityDto): Promise<PrismaCelebrityModel> {
    return this.prisma.celebrity.create({
      data: createCelebrityDto,
    });
  }

  async findAll(): Promise<PrismaCelebrityModel[]> {
    return this.prisma.celebrity.findMany();
  }

  async findOne(id: string): Promise<PrismaCelebrityModel> {
    const celebrity = await this.prisma.celebrity.findUnique({
      where: { id },
    });
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID "${id}" not found`);
    }
    return celebrity;
  }

  // Change parameter type from CreateCelebrityDto to UpdateCelebrityDto
  async update(id: string, updateCelebrityDto: UpdateCelebrityDto): Promise<PrismaCelebrityModel> {
    try {
      return await this.prisma.celebrity.update({
        where: { id },
        data: updateCelebrityDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Celebrity with ID "${id}" not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.celebrity.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Celebrity with ID "${id}" not found`);
      }
      throw error;
    }
  }
}