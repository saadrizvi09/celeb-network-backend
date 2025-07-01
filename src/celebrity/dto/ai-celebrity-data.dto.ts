import { IsString, IsOptional, IsUrl, IsInt, IsArray, ArrayMinSize, Min } from 'class-validator';

export class AiCelebrityDataDto {
  @IsString()
  name: string;

  @IsString()
  category: string; 
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @IsOptional()
  @IsString()
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
  @Min(0) 
  fanbaseCount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  sampleSetlistOrKeynoteTopics?: string[];
}