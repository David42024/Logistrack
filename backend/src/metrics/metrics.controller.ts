import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('public')
  getPublicMetrics() {
    return this.metricsService.getPublicMetrics();
  }

  @Get('historical')
  @ApiBearerAuth()
  getHistoricalMetrics(@Query('days') days: string = '7') {
    return this.metricsService.getHistoricalMetrics(parseInt(days));
  }
}
