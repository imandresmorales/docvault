import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  timestamp: string;
  version: string;
  services: {
    database: 'ok' | 'error';
  };
}

/**
 * GET /health — Public health check endpoint.
 * Used by load balancers, uptime monitors, and CI/CD pipelines.
 * Does NOT expose sensitive information.
 */
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  root() {
    return { name: 'DocVault API', version: process.env.npm_package_version || '1.0.0' };
  }

  @Get('health')
  async health(): Promise<HealthStatus> {
    let dbStatus: 'ok' | 'error' = 'ok';

    try {
      // Lightweight DB ping — does not return sensitive data
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    const overallStatus: HealthStatus['status'] =
      dbStatus === 'error' ? 'degraded' : 'ok';

    return {
      status:    overallStatus,
      uptime:    Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version:   process.env.npm_package_version || '1.0.0',
      services: {
        database: dbStatus,
      },
    };
  }
}
