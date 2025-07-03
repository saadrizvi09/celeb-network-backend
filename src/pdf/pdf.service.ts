import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core'; 
import chromium from '@sparticuz/chromium'; 

@Injectable()
export class PdfService {
  async generateCelebrityPdf(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      console.log('[PdfService] Attempting to launch Puppeteer browser with @sparticuz/chromium...');

      browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'], 
        defaultViewport: { width: 1280, height: 720 }, 
        executablePath: await chromium.executablePath(), 
        headless: true, 
      });

      console.log('[PdfService] Puppeteer browser launched successfully.');

      const page = await browser.newPage();
      console.log('[PdfService] New page created.');

      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0', 
      });
      console.log('[PdfService] HTML content set on page.');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true, 
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
