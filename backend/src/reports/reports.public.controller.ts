import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('public/reports')
export class ReportsPublicController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('login-metrics')
  getLoginMetrics() {
    return this.reportsService.getLoginMetrics();
  }
}
