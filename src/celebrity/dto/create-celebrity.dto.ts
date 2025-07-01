import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ArrayMinSize, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCelebrityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true }) 
  @ArrayMinSize(1) 
  category: string[]; 

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
  
  sampleSetlistOrKeynoteTopics?: any; 

  @IsString()
  @IsOptional()
  instagramHandle?: string;
}