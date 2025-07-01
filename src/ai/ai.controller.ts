import { Controller, Get, Query, Param, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { AiService } from './ai.service';
import { IsString, IsNotEmpty } from 'class-validator';
import { AiCelebrityDataDto } from '../celebrity/dto/ai-celebrity-data.dto'; 

class SuggestCelebrityQueryDto {
  @IsString()
  @IsNotEmpty()
  q: string; 
}

class AutofillCelebrityParamDto {
  @IsString()
  @IsNotEmpty()
  name: string; // The celebrity name from the URL parameter
}

@Controller('ai') // Base route: /ai
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('suggest-celebrities')
  async suggest(@Query() queryDto: SuggestCelebrityQueryDto): Promise<string[]> {
    return this.aiService.suggestCelebrities(queryDto.q);
  }

  // --- NEW ENDPOINT FOR AUTO-FILL DATA ---
  @Get('autofill-celebrity/:name') 
  async autofillCelebrityData(@Param() params: AutofillCelebrityParamDto): Promise<AiCelebrityDataDto> {
    const celebrityData = await this.aiService.getCelebrityDetailsForAutofill(params.name);
    if (!celebrityData) {
      throw new NotFoundException(`Could not generate autofill data for celebrity: "${params.name}". Please try a different name or provide more details.`);
    }
    return celebrityData;
  }
}