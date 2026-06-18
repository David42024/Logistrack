import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { Route, RouteStatus } from './entities/route.entity';
import { RouteStop, StopStatus } from './entities/route-stop.entity';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas' })
  @ApiResponse({ status: 200, type: [Route] })
  getAllRoutes() {
    return this.routesService.getAllRoutes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ruta por ID' })
  @ApiResponse({ status: 200, type: Route })
  getRouteById(@Param('id') id: string) {
    return this.routesService.getRouteById(id);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Obtener rutas asignadas a un conductor' })
  @ApiResponse({ status: 200, type: [Route] })
  getRoutesByDriver(@Param('driverId') driverId: string) {
    return this.routesService.getRoutesByDriver(driverId);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Obtener rutas por fecha' })
  @ApiResponse({ status: 200, type: [Route] })
  getRoutesByDate(@Param('date') date: string) {
    return this.routesService.getRoutesByDate(new Date(date));
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Obtener rutas por estado' })
  @ApiResponse({ status: 200, type: [Route] })
  getRoutesByStatus(@Param('status') status: RouteStatus) {
    return this.routesService.getRoutesByStatus(status);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas de rutas' })
  @ApiResponse({ status: 200, description: 'Métricas de rutas' })
  getRouteMetrics() {
    return this.routesService.getRouteMetrics();
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva ruta' })
  @ApiResponse({ status: 201, type: Route })
  createRoute(@Body() data: Partial<Route>) {
    return this.routesService.createRoute(data);
  }

  @Post(':id/stops')
  @ApiOperation({ summary: 'Agregar parada a una ruta' })
  @ApiResponse({ status: 201, type: RouteStop })
  addStopToRoute(@Param('id') id: string, @Body() data: Partial<RouteStop>) {
    return this.routesService.addStopToRoute(id, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una ruta' })
  @ApiResponse({ status: 200, type: Route })
  updateRoute(@Param('id') id: string, @Body() data: Partial<Route>) {
    return this.routesService.updateRoute(id, data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de una ruta' })
  @ApiResponse({ status: 200, type: Route })
  updateRouteStatus(@Param('id') id: string, @Body('status') status: RouteStatus) {
    return this.routesService.updateRouteStatus(id, status);
  }

  @Patch('stops/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de una parada' })
  @ApiResponse({ status: 200, type: RouteStop })
  updateStopStatus(@Param('id') id: string, @Body('status') status: StopStatus) {
    return this.routesService.updateStopStatus(id, status);
  }

  @Post(':id/optimize')
  @ApiOperation({ summary: 'Optimizar una ruta' })
  @ApiResponse({ status: 200, type: Route })
  optimizeRoute(@Param('id') id: string) {
    return this.routesService.optimizeRoute(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ruta' })
  @ApiResponse({ status: 204 })
  deleteRoute(@Param('id') id: string) {
    return this.routesService.deleteRoute(id);
  }
}
