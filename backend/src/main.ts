import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers via Helmet
  // CSP is relaxed to allow the frontend origin for file streaming.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allows the frontend to embed files
      contentSecurityPolicy: {
        directives: {
          defaultSrc:  ["'self'"],
          scriptSrc:   ["'self'", "'unsafe-inline'"],       // needed for pdf.js worker
          styleSrc:    ["'self'", "'unsafe-inline'"],
          imgSrc:      ["'self'", 'data:', 'blob:'],
          mediaSrc:    ["'self'", 'blob:'],
          workerSrc:   ["'self'", 'blob:'],
          connectSrc:  ["'self'"],
          frameSrc:    ["'none'"],
          objectSrc:   ["'none'"],
        },
      },
      // Prevent clickjacking
      frameguard: { action: 'deny' },
      // Force HTTPS in production
      hsts: process.env.NODE_ENV === 'production'
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
    }),
  );

  // Configure CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe — strips unknown fields and transforms types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // remove unknown properties
      forbidNonWhitelisted: true, // throw if unknown properties are present
      transform: true,           // auto-transform payloads to DTOs
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`DocVault API running on http://localhost:${port}`);
}
bootstrap();
