// src/pdf/pdf.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateCelebrityPdf(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      console.log('[PdfService] Attempting to launch Puppeteer browser...');
      // IMPORTANT: These arguments are crucial for Puppeteer to run in a Docker/containerized environment like Render.
      // --no-sandbox: Disables the sandbox, which is often required in container environments.
      // --disable-setuid-sandbox: Another sandbox-related flag.
      // --disable-dev-shm-usage: Prevents issues with /dev/shm, common in Docker.
      // --disable-accelerated-video-decode, --disable-gpu, --no-zygote, --single-process: Reduce resource usage and improve compatibility.
      browser = await puppeteer.launch({
        headless: true, // Use 'new' for new headless mode if available, otherwise 'true'
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-video-decode',
          '--disable-gpu',
          '--no-zygote',
          '--single-process'
        ],
        // If Puppeteer still struggles to find Chromium, you might need to specify executablePath
        // For Render, this often means ensuring the underlying Docker image has Chromium installed,
        // or using a package like 'chrome-aws-lambda' which bundles it.
        // For now, let's rely on Puppeteer finding it.
      });
      console.log('[PdfService] Puppeteer browser launched successfully.');

      const page = await browser.newPage();
      console.log('[PdfService] New page created.');

      // Set the content of the page
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0', // Wait for network to be idle
      });
      console.log('[PdfService] HTML content set on page.');

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true, // Include background colors/images
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });
      console.log('[PdfService] PDF generated successfully.');

      return pdfBuffer;
    } catch (error: any) {
      console.error('[PdfService] Error during PDF generation process:', error.message);
      // Log the full error object for more details
      console.error('[PdfService] Full error object (PDF generation):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw new InternalServerErrorException('Failed to generate PDF.');
    } finally {
      if (browser) {
        console.log('[PdfService] Closing Puppeteer browser.');
        await browser.close();
      }
    }
  }
}
