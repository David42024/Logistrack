import { Controller, Get, Res, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('kpis')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  getKPIs() {
    return this.reportsService.getKPIs();
  }

  @Get('deliveries-by-day')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  getDeliveriesByDay(@Query('days') days = '7') {
    return this.reportsService.getDeliveriesByDay(Number(days));
  }

  @Get('top-drivers')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  getTopDrivers() {
    return this.reportsService.getTopDrivers();
  }

  @Get('export/pdf')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async exportPdf(@Res() res: Response) {
    return this.reportsService.generatePdfReport(res);
  }

  @Get('export/excel')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async exportExcel(@Res() res: Response) {
    return this.reportsService.generateExcelReport(res);
  }

  @Get('analytics')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  getAnalytics() {
    return this.reportsService.getAnalytics();
  }
}
