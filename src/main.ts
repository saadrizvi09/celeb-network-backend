import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // --- THIS IS THE CORRECTED 'origin' ARRAY ---
    origin: [
      'http://localhost:3000', // Your local frontend development server
      'https://celeb-network-frontend-dusky.vercel.app', // <-- YOUR ACTUAL, CORRECT VERCEL PRODUCTION URL
      // This regex allows all Vercel preview deployment URLs for your project.
      // Replace 'celeb-network-frontend' with your actual Vercel project name if it's different.
      /^https:\/\/celeb-network-frontend-[a-zA-Z0-9-]+\.vercel\.app$/,
    ],
    // ---------------------------------------------
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Set to true if you are sending cookies/auth headers (e.g., JWT in headers)
  });
  // ----------------------------------------------------------------------

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();