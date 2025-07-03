import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ArrayMinSize } from 'class-validator';
import { Type, Transform } from 'class-transformer'; 
export class CreateCelebrityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
       
        return [];
      }
    }
    return value;
  })
  @IsArray({ message: 'Category must be an array' }) 
  @IsString({ each: true, message: 'Each category element must be a string' }) 
  @ArrayMinSize(1, { message: 'Category must contain at least 1 element' }) 
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
  
  sampleSetlistOrKeynoteTopics?: string[];

  @IsString()
  @IsOptional()
  instagramHandle?: string;
}