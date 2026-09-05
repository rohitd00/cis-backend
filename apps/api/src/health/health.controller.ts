import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness/readiness check including database connectivity' })
  async check(@Res() res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      res.status(HttpStatus.OK).json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
