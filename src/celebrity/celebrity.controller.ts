// src/celebrity/celebrity.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CelebrityService } from './celebrity.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto'; // <-- IMPORT UpdateCelebrityDto
import { Celebrity as PrismaCelebrityModel } from '@prisma/client'; // <-- IMPORT Prisma's generated type

@Controller('celebrities')
export class CelebrityController {
  constructor(private readonly celebrityService: CelebrityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Use PrismaCelebrityModel as the return type
  async create(@Body() createCelebrityDto: CreateCelebrityDto): Promise<PrismaCelebrityModel> {
    // Here, Prisma will take the string[] from DTO and convert to JSONB
    return this.celebrityService.create(createCelebrityDto);
  }

  @Get()
  // Use PrismaCelebrityModel[] as the return type
  async findAll(): Promise<PrismaCelebrityModel[]> {
    // Prisma will return category as JsonValue, which includes string[] (if it is)
    return this.celebrityService.findAll();
  }

  @Get(':id')
  // Use PrismaCelebrityModel as the return type
  async findOne(@Param('id') id: string): Promise<PrismaCelebrityModel> {
    return this.celebrityService.findOne(id);
  }

  @Put(':id')
  // Use PrismaCelebrityModel as the return type
  // And use UpdateCelebrityDto for the body
  async update(@Param('id') id: string, @Body() updateCelebrityDto: UpdateCelebrityDto): Promise<PrismaCelebrityModel> {
    return this.celebrityService.update(id, updateCelebrityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async remove(@Param('id') id: string): Promise<void> {
    await this.celebrityService.remove(id);
  }
}