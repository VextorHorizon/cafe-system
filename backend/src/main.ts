import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  // Enable global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Listen on port from env or default 3001
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Backend running on port ${process.env.PORT ?? 3001}`);
}
bootstrap();
