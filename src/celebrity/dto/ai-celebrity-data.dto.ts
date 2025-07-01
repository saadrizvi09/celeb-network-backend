// src/celebrity/dto/ai-celebrity-data.dto.ts
import { IsString, IsOptional, IsUrl, IsInt, IsArray, ArrayMinSize, Min } from 'class-validator';
// Note: 'Type' from 'class-transformer' is not directly used here but can be helpful for nested objects if needed

export class AiCelebrityDataDto {
  @IsString()
  name: string;

  @IsString()
  category: string; // e.g., 'Singer', 'Speaker', 'Actor'

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @IsOptional()
  @IsString() // Using string for handle. If it's a full URL, use @IsUrl()
  instagramHandle?: string;

  @IsOptional()
  @IsString()
  youtubeChannel?: string;

  @IsOptional()
  @IsString()
  spotifyId?: string;

  @IsOptional()
  @IsString()
  imdbId?: string;

  @IsOptional()
  @IsInt()
  @Min(0) // AI might give 0 or no fanbase, allowing 0
  fanbaseCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0) // Allow empty array if no topics
  sampleSetlistOrKeynoteTopics?: string[];
}