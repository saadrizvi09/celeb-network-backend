import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CelebrityService } from './celebrity.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto'; 
import { Celebrity as PrismaCelebrityModel } from '@prisma/client'; 

@Controller('celebrities')
export class CelebrityController {
  constructor(private readonly celebrityService: CelebrityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCelebrityDto: CreateCelebrityDto): Promise<PrismaCelebrityModel> {
    return this.celebrityService.create(createCelebrityDto);
  }

  @Get()
  async findAll(): Promise<PrismaCelebrityModel[]> {
    return this.celebrityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PrismaCelebrityModel> {
    return this.celebrityService.findOne(id);
  }

  @Put(':id')
  
  async update(@Param('id') id: string, @Body() updateCelebrityDto: UpdateCelebrityDto): Promise<PrismaCelebrityModel> {
    return this.celebrityService.update(id, updateCelebrityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  async remove(@Param('id') id: string): Promise<void> {
    await this.celebrityService.remove(id);
  }
}