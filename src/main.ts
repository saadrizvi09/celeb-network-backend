import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://celeb-network-frontend.vercel.app', 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  });
  // ----------------------------------------------------------------------

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();