// src/celebrity/celebrity.controller.ts
import {
  Controller,
  Get,
  Post, // Assuming you have a POST for creating celebrities
  Body,
  Param,
  Res, // Used for sending the PDF response
  NotFoundException,
  InternalServerErrorException,
  UsePipes,
  ValidationPipe,
  Query, // IMPORTANT: Add Query import for AI suggestion endpoint
} from '@nestjs/common';
import { CelebrityService } from './celebrity.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto'; // Assuming you have this DTO
import { Response } from 'express'; // IMPORTANT: Import Response from express
import { PdfService } from '../pdf/pdf.service'; // IMPORTANT: Import PdfService
import { AiService } from '../ai/ai.service'; // IMPORTANT: Import AiService

@Controller('celebrities')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Apply validation pipe globally to this controller
export class CelebrityController {
  constructor(
    private readonly celebrityService: CelebrityService,
    private readonly pdfService: PdfService, // Correctly injected PdfService
    private readonly aiService: AiService, // IMPORTANT: Inject AiService here
  ) {}

  @Post()
  // No @UseGuards here, as per your original file structure.
  // If you wish to protect this, add @UseGuards(JwtAuthGuard) above this method.
  async create(@Body() createCelebrityDto: CreateCelebrityDto) {
    return this.celebrityService.create(createCelebrityDto);
  }

  @Get()
  // This endpoint is public
  async findAll() {
    return this.celebrityService.findAll();
  }

  @Get(':id')
  // This endpoint is public
  async findOne(@Param('id') id: string) {
    const celebrity = await this.celebrityService.findOne(id);
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID "${id}" not found.`);
    }
    return celebrity;
  }

  @Get('by-name/:name')
  // This endpoint is public
  async findByName(@Param('name') name: string) {
    const celebrity = await this.celebrityService.findByName(name);
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with name "${name}" not found.`);
    }
    return celebrity;
  }

  // --- AI Endpoints (These are public and call AiService) ---
  @Get('ai/suggest-celebrities')
  // This endpoint is public
  async suggestCelebrities(@Query('q') query: string) {
    // IMPORTANT FIX: Call aiService.suggestCelebrities
    return this.aiService.suggestCelebrities(query);
  }

  @Get('ai/autofill-celebrity/:name')
  // This endpoint is public
  async autofillCelebrityData(@Param('name') name: string) {
    // IMPORTANT FIX: Call aiService.getCelebrityDetailsForAutofill
    return this.aiService.getCelebrityDetailsForAutofill(name);
  }
  // --- END AI Endpoints ---


  // PDF Generation Endpoint
  @Get(':id/pdf')
  // No @UseGuards here, as per your original file structure.
  // If you wish to protect this, add @UseGuards(JwtAuthGuard) above this method.
  async generateCelebrityProfilePdf(
    @Param('id') id: string,
    @Res() res: Response, // Use @Res() decorator for direct response manipulation
  ) {
    const celebrity = await this.celebrityService.findOne(id);
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID "${id}" not found.`);
    }

    // Construct HTML for the PDF. This is a crucial step.
    // You can make this as fancy as your frontend profile page.
    // Ensure all styles are inline or within <style> tags as Puppeteer renders HTML directly.
    let htmlContent = `
      <html>
      <head>
        <title>${celebrity.name} Profile</title>
        <style>
          body { font-family: sans-serif; margin: 40px; color: #333; }
          h1 { color: #1a202c; font-size: 28px; margin-bottom: 10px; }
          h2 { color: #2d3748; font-size: 22px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          p { margin-bottom: 8px; line-height: 1.6; }
          strong { font-weight: bold; }
          .section { margin-bottom: 25px; }
          .social-link { margin-right: 15px; display: inline-block; }
          img { max-width: 200px; border-radius: 50%; display: block; margin: 0 auto 20px; }
          ul { list-style: disc; margin-left: 20px; }
        </style>
      </head>
      <body>
        ${celebrity.profileImageUrl ? `<img src="${celebrity.profileImageUrl}" alt="${celebrity.name}" />` : ''}
        <h1>${celebrity.name}</h1>
        <p><strong>Category:</strong> ${Array.isArray(celebrity.category) ? celebrity.category.join(', ') : celebrity.category}</p>
        <p><strong>Country:</strong> ${celebrity.country}</p>
        ${celebrity.fanbaseCount ? `<p><strong>Fanbase:</strong> ${celebrity.fanbaseCount.toLocaleString()}</p>` : ''}

        ${celebrity.description ? `
          <div class="section">
            <h2>About</h2>
            <p>${celebrity.description}</p>
          </div>
        ` : ''}

        <div class="section">
          <h2>Social & Media</h2>
          ${celebrity.instagramHandle ? `<p class="social-link"><strong>Instagram:</strong> @${celebrity.instagramHandle}</p>` : ''}
          ${celebrity.youtubeChannel ? `<p class="social-link"><strong>YouTube:</strong> <a href="${celebrity.youtubeChannel}" target="_blank" rel="noopener noreferrer">${celebrity.youtubeChannel}</a></p>` : ''}
          ${celebrity.spotifyId ? `<p class="social-link"><strong>Spotify:</strong> ${celebrity.spotifyId}</p>` : ''}
          ${celebrity.imdbId ? `<p class="social-link"><strong>IMDb:</strong> <a href="https://www.imdb.com/name/${celebrity.imdbId}/" target="_blank" rel="noopener noreferrer">${celebrity.imdbId}</a></p>` : ''}
        </div>

        ${Array.isArray(celebrity.sampleSetlistOrKeynoteTopics) && celebrity.sampleSetlistOrKeynoteTopics.length > 0 ? `
          <div class="section">
            <h2>Setlist / Topics</h2>
            <ul>
              ${(Array.isArray(celebrity.sampleSetlistOrKeynoteTopics) ? celebrity.sampleSetlistOrKeynoteTopics : [celebrity.sampleSetlistOrKeynoteTopics]).map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    try {
      const pdfBuffer = await this.pdfService.generateCelebrityPdf(htmlContent);

      // Set headers for PDF download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${celebrity.name.replace(/\s/g, '_')}_profile.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      // Send the PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Failed to generate or send PDF:', error);
      throw new InternalServerErrorException('Failed to generate PDF for celebrity profile.');
    }
  }
}