// src/celebrity/celebrity.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  NotFoundException,
  InternalServerErrorException,
  UsePipes,
  ValidationPipe,
  UseGuards, // Import UseGuards
} from '@nestjs/common';
import { CelebrityService } from './celebrity.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { Response } from 'express';
import { PdfService } from '../pdf/pdf.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard

// IMPORTANT FIX: Remove @UseGuards(JwtAuthGuard) from the class level
// @UseGuards(JwtAuthGuard) // REMOVE THIS LINE
@Controller('celebrities')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CelebrityController {
  constructor(
    private readonly celebrityService: CelebrityService,
    private readonly pdfService: PdfService,
  ) {}

  // This endpoint requires authentication (only logged-in users can create)
  @UseGuards(JwtAuthGuard) // Apply guard only to this specific route
  @Post()
  async create(@Body() createCelebrityDto: CreateCelebrityDto) {
    // You might want to add role-based authorization here as well
    // e.g., if (req.user.role !== 'celebrity') throw new ForbiddenException();
    return this.celebrityService.create(createCelebrityDto);
  }

  @Get()
  // This endpoint should be public (no @UseGuards here)
  async findAll() {
    return this.celebrityService.findAll();
  }

  @Get(':id')
  // This endpoint should be public (no @UseGuards here)
  async findOne(@Param('id') id: string) {
    const celebrity = await this.celebrityService.findOne(id);
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID "${id}" not found.`);
    }
    return celebrity;
  }

  // NEW: Endpoint to get celebrity by name - should also be public
  @Get('by-name/:name')
  async findByName(@Param('name') name: string) {
    const celebrity = await this.celebrityService.findByName(name);
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with name "${name}" not found.`);
    }
    return celebrity;
  }

  // PDF Generation Endpoint - This should likely be protected
  @UseGuards(JwtAuthGuard) // Apply guard only to this specific route
  @Get(':id/pdf')
  async generateCelebrityProfilePdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const celebrity = await this.celebrityService.findOne(id);
    if (!celebrity) {
      throw new NotFoundException(`Celebrity with ID "${id}" not found.`);
    }

    // Ensure profileImageUrl is handled correctly if it's an empty string or null
    const profileImageHtml = celebrity.profileImageUrl && celebrity.profileImageUrl !== ''
      ? `<img src="${celebrity.profileImageUrl}" alt="${celebrity.name}" />`
      : '';

    // Ensure category and sampleSetlistOrKeynoteTopics are handled as arrays for display
    const categoriesDisplay = Array.isArray(celebrity.category)
      ? celebrity.category.join(', ')
      : celebrity.category; // Fallback if it somehow comes as a string

    const topicsDisplay = Array.isArray(celebrity.sampleSetlistOrKeynoteTopics) && celebrity.sampleSetlistOrKeynoteTopics.length > 0
      ? `<ul>${celebrity.sampleSetlistOrKeynoteTopics.map(item => `<li>${item}</li>`).join('')}</ul>`
      : '';

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
        ${profileImageHtml}
        <h1>${celebrity.name}</h1>
        <p><strong>Category:</strong> ${categoriesDisplay}</p>
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
            ${topicsDisplay}
          </div>
        ` : ''}
      </body>
      </html>
    `;

    try {
      const pdfBuffer = await this.pdfService.generateCelebrityPdf(htmlContent);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${celebrity.name.replace(/\s/g, '_')}_profile.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Failed to generate or send PDF:', error);
      throw new InternalServerErrorException('Failed to generate PDF for celebrity profile.');
    }
  }
}