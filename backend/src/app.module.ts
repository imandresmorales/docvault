import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { validateEnv } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: '.env',
    }),
    /**
     * Rate limiting:
     *  - "short":  max 20 requests per 10 seconds (burst protection)
     *  - "medium": max 100 requests per minute (normal use)
     *  - "long":   max 500 requests per hour (abuse protection)
     * Adjust values per environment via .env if needed.
     */
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 10_000,    limit: 20  },
      { name: 'medium', ttl: 60_000,    limit: 100 },
      { name: 'long',   ttl: 3_600_000, limit: 500 },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    DocumentsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
