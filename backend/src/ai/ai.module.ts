import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { TextExtractorService } from './text-extractor.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AiService, TextExtractorService],
  exports: [AiService, TextExtractorService],
})
export class AiModule {}
