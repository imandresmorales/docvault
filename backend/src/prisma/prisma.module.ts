import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule provides database access throughout the application.
 * Import this module in any feature module that needs database access.
 * PrismaService is exported so it can be injected in other modules.
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
