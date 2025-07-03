// src/main.ts (in your NestJS backend project)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- IMPORTANT: Ensure this CORS configuration is present and correct ---
  app.enableCors({
    origin: [
      'http://localhost:3000', // <--- This is crucial for your local frontend
      'https://celeb-network-frontend.vercel.app', // You'll add your Vercel URL here later
      // Add any other specific domains if needed
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Set to true if you are sending cookies/auth headers
  });
  // ----------------------------------------------------------------------

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();