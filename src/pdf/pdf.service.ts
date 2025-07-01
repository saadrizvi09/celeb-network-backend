import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateCelebrityPdf(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      
      browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', 
        '--disable-accelerated-video-decode',
        '--disable-gpu',
        '--no-zygote',
        '--single-process' 
    ],
   
});
      const page = await browser.newPage();

      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

   
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

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new InternalServerErrorException('Failed to generate PDF.');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}