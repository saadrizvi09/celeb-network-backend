
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';
import { Celebrity as PrismaCelebrityModel } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CelebrityService {
  constructor(private prisma: PrismaService) {}

  async create(createCelebrityDto: CreateCelebrityDto): Promise<PrismaCelebrityModel> {
    const data = {
      ...createCelebrityDto,
      category: createCelebrityDto.category || [],
      sampleSetlistOrKeynoteTopics: createCelebrityDto.sampleSetlistOrKeynoteTopics || [],
      fanbaseCount: createCelebrityDto.fanbaseCount || 0, 
    };

    return this.prisma.celebrity.create({
      data: data,
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

  async findByName(name: string): Promise<PrismaCelebrityModel | null> {
    return this.prisma.celebrity.findUnique({
      where: { name: name },
    });
  }

  async update(id: string, updateCelebrityDto: UpdateCelebrityDto): Promise<PrismaCelebrityModel> {
    const dataToUpdate: any = { ...updateCelebrityDto };

    if (updateCelebrityDto.category !== undefined) {
      dataToUpdate.category = updateCelebrityDto.category || [];
    }

    if (updateCelebrityDto.sampleSetlistOrKeynoteTopics !== undefined) {
      dataToUpdate.sampleSetlistOrKeynoteTopics = updateCelebrityDto.sampleSetlistOrKeynoteTopics || [];
    }

    try {
      return await this.prisma.celebrity.update({
        where: { id },
        data: dataToUpdate,
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