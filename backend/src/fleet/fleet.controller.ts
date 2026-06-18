import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FleetService } from './fleet.service';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { Maintenance, MaintenanceStatus } from './entities/maintenance.entity';

@ApiTags('fleet')
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('vehicles')
  @ApiOperation({ summary: 'Obtener todos los vehículos' })
  @ApiResponse({ status: 200, type: [Vehicle] })
  getAllVehicles() {
    return this.fleetService.getAllVehicles();
  }

  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Obtener un vehículo por ID' })
  @ApiResponse({ status: 200, type: Vehicle })
  getVehicleById(@Param('id') id: string) {
    return this.fleetService.getVehicleById(id);
  }

  @Get('vehicles/active')
  @ApiOperation({ summary: 'Obtener vehículos activos' })
  @ApiResponse({ status: 200, type: [Vehicle] })
  getActiveVehicles() {
    return this.fleetService.getActiveVehicles();
  }

  @Get('vehicles/maintenance')
  @ApiOperation({ summary: 'Obtener vehículos en mantenimiento' })
  @ApiResponse({ status: 200, type: [Vehicle] })
  getVehiclesInMaintenance() {
    return this.fleetService.getVehiclesInMaintenance();
  }

  @Get('vehicles/:id/maintenance')
  @ApiOperation({ summary: 'Obtener historial de mantenimiento de un vehículo' })
  @ApiResponse({ status: 200, type: [Maintenance] })
  getMaintenanceByVehicle(@Param('id') id: string) {
    return this.fleetService.getMaintenanceByVehicle(id);
  }

  @Get('maintenance/upcoming')
  @ApiOperation({ summary: 'Obtener mantenimiento programado pendiente' })
  @ApiResponse({ status: 200, type: [Maintenance] })
  getUpcomingMaintenance() {
    return this.fleetService.getUpcomingMaintenance();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas de la flota' })
  @ApiResponse({ status: 200, description: 'Métricas de flota' })
  getFleetMetrics() {
    return this.fleetService.getFleetMetrics();
  }

  @Post('vehicles')
  @ApiOperation({ summary: 'Crear un nuevo vehículo' })
  @ApiResponse({ status: 201, type: Vehicle })
  createVehicle(@Body() data: Partial<Vehicle>) {
    return this.fleetService.createVehicle(data);
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Crear un registro de mantenimiento' })
  @ApiResponse({ status: 201, type: Maintenance })
  createMaintenance(@Body() data: Partial<Maintenance>) {
    return this.fleetService.createMaintenance(data);
  }

  @Put('vehicles/:id')
  @ApiOperation({ summary: 'Actualizar un vehículo' })
  @ApiResponse({ status: 200, type: Vehicle })
  updateVehicle(@Param('id') id: string, @Body() data: Partial<Vehicle>) {
    return this.fleetService.updateVehicle(id, data);
  }

  @Patch('vehicles/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de un vehículo' })
  @ApiResponse({ status: 200, type: Vehicle })
  updateVehicleStatus(@Param('id') id: string, @Body('status') status: VehicleStatus) {
    return this.fleetService.updateVehicleStatus(id, status);
  }

  @Put('maintenance/:id')
  @ApiOperation({ summary: 'Actualizar un registro de mantenimiento' })
  @ApiResponse({ status: 200, type: Maintenance })
  updateMaintenance(@Param('id') id: string, @Body() data: Partial<Maintenance>) {
    return this.fleetService.updateMaintenance(id, data);
  }

  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Eliminar un vehículo' })
  @ApiResponse({ status: 204 })
  deleteVehicle(@Param('id') id: string) {
    return this.fleetService.deleteVehicle(id);
  }
}
