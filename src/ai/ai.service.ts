// src/ai/ai.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { AiCelebrityDataDto } from '../celebrity/dto/ai-celebrity-data.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private suggestionModel: any;
  private jsonModel: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);

    this.suggestionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.jsonModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 
  }

  async suggestCelebrities(query: string): Promise<string[]> {
    const prompt = `Based on the following description, suggest a list of 3-5 celebrity names that match. Respond only with a comma-separated list of names, e.g., "Celebrity1, Celebrity2, Celebrity3". If no clear matches, respond with "None".\nDescription: "${query}"`;

    try {
      const result = await this.suggestionModel.generateContent(prompt);
      const response = result.response;
      const responseText = response.text().trim();

      if (responseText.toLowerCase() === 'none' || !responseText) {
        return [];
      }
      return responseText.split(',').map(name => name.trim());
    } catch (error) {
      console.error('Error suggesting celebrities from Gemini AI:', error);
      console.error('Full Gemini error object (suggestCelebrities):', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException('Failed to get celebrity suggestions from AI service.');
    }
  }

  
  async getCelebrityDetailsForAutofill(celebrityName: string): Promise<AiCelebrityDataDto | null> {
    const prompt = `Provide detailed information for the celebrity "${celebrityName}" in JSON format. Include the following fields: name, category (e.g., Singer, Actor, Speaker), country, description, profileImageUrl, instagramHandle, youtubeChannel, spotifyId, imdbId, fanbaseCount (as a number), and sampleSetlistOrKeynoteTopics (as an array of strings). If a piece of information is not available or applicable, omit the field. Ensure all string values are enclosed in double quotes. Only return the JSON object, nothing else.`;

    try {
      const result = await this.jsonModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const response = result.response;
      const jsonString = response.text().trim();

      if (!jsonString) {
        console.warn('Gemini returned no JSON content for celebrity details:', celebrityName);
        return null;
      }

      let cleanedJsonString = jsonString;
      if (cleanedJsonString.startsWith('```json')) {
        cleanedJsonString = cleanedJsonString.substring(7);
      }
      if (cleanedJsonString.endsWith('```')) {
        cleanedJsonString = cleanedJsonString.substring(0, cleanedJsonString.length - 3);
      }
      cleanedJsonString = cleanedJsonString.trim();

      try {
        const data: AiCelebrityDataDto = JSON.parse(cleanedJsonString);
        if (!data.name || !data.category || !data.country) {
          console.warn('AI-generated JSON is missing required fields (name, category, country):', data);
          return null;
        }
        return data;
      } catch (parseError) {
        console.error('Failed to parse AI-generated JSON:', parseError, 'JSON string received:', cleanedJsonString);
        return null;
      }

    } catch (error) {
      console.error(`Error getting AI-generated details for ${celebrityName}:`, error);
      console.error('Full Gemini error object (getCelebrityDetailsForAutofill):', JSON.stringify(error, null, 2));
      throw new InternalServerErrorException(`Failed to get celebrity details for ${celebrityName} from AI.`);
    }
  }
}