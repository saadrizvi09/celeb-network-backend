// src/celebrity/dto/update-celebrity.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // or '@nestjs/swagger' if you use Swagger
import { CreateCelebrityDto } from './create-celebrity.dto';

// All fields in UpdateCelebrityDto will be optional versions of CreateCelebrityDto's fields
export class UpdateCelebrityDto extends PartialType(CreateCelebrityDto) {}