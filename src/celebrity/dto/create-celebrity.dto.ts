// src/celebrity/dto/create-celebrity.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ArrayMinSize, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCelebrityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true }) // Ensures each item in the array is a string
  @ArrayMinSize(1) // Ensures it's not an empty array if required to have items
  // Ensure this property matches the nullability of your Prisma schema
  // If your schema.prisma has `category Json?` then it can be `any[] | null`
  // If your schema.prisma has `category Json @default("[]")`, it will always be an array (even empty)
  category: string[]; // Keep this as string[] for now, as that's what you intend to store

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  youtubeChannel?: string;

  @IsString()
  @IsOptional()
  spotifyId?: string;

  @IsString()
  @IsOptional()
  imdbId?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  fanbaseCount?: number;

  @IsOptional()
  // If sampleSetlistOrKeynoteTopics can be a complex JSON object, you might just use `any`
  sampleSetlistOrKeynoteTopics?: any; // Or a more specific interface if you have one

  @IsString()
  @IsOptional()
  instagramHandle?: string;
}