// src/pdf/pdf.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core'; // Use puppeteer-core
import chromium from '@sparticuz/chromium'; // Correctly import the default export

@Injectable()
export class PdfService {
  async generateCelebrityPdf(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      console.log('[PdfService] Attempting to launch Puppeteer browser with @sparticuz/chromium...');

      // Configure Puppeteer to use the Chromium executable from @sparticuz/chromium
      browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'], // Access args from the imported 'chromium' object
        defaultViewport: { width: 1280, height: 720 }, // A sensible default viewport for PDF generation
        executablePath: await chromium.executablePath(), // Access executablePath from the imported 'chromium' object
        headless: true, // Explicitly set headless to true, as @sparticuz/chromium is designed for this
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
