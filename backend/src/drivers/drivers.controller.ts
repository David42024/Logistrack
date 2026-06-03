import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COORDINATOR)
  findAll() {
    return this.driversService.findAll();
  }

  @Get('available')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  findAvailable() {
    return this.driversService.findAvailable();
  }

  @Get('suggested')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  getSuggested() {
    return this.driversService.getSuggestedDriver();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.DRIVER)
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: any) {
    return this.driversService.create(body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  update(@Param('id') id: string, @Body() body: any) {
    return this.driversService.update(id, body);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.DRIVER)
  updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.driversService.updateStatus(id, body.status);
  }
}
