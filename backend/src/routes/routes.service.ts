import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route, RouteStatus } from './entities/route.entity';
import { RouteStop, StopStatus } from './entities/route-stop.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(RouteStop)
    private routeStopRepository: Repository<RouteStop>,
  ) {}

  async getAllRoutes(): Promise<Route[]> {
    return this.routeRepository.find({
      relations: ['stops'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async getRouteById(id: string): Promise<Route> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['stops'],
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async createRoute(data: Partial<Route>): Promise<Route> {
    const route = this.routeRepository.create(data);
    return this.routeRepository.save(route);
  }

  async updateRoute(id: string, data: Partial<Route>): Promise<Route> {
    const route = await this.getRouteById(id);
    Object.assign(route, data);
    return this.routeRepository.save(route);
  }

  async updateRouteStatus(id: string, status: RouteStatus): Promise<Route> {
    const route = await this.getRouteById(id);
    route.status = status;
    return this.routeRepository.save(route);
  }

  async deleteRoute(id: string): Promise<void> {
    const route = await this.getRouteById(id);
    await this.routeRepository.remove(route);
  }

  async addStopToRoute(routeId: string, stopData: Partial<RouteStop>): Promise<RouteStop> {
    const route = await this.getRouteById(routeId);
    const stop = this.routeStopRepository.create({
      ...stopData,
      routeId,
      sequence: route.stops.length + 1,
    });
    return this.routeStopRepository.save(stop);
  }

  async updateStopStatus(id: string, status: StopStatus): Promise<RouteStop> {
    const stop = await this.routeStopRepository.findOne({ where: { id } });
    if (!stop) {
      throw new NotFoundException('Route stop not found');
    }
    stop.status = status;
    return this.routeStopRepository.save(stop);
  }

  async getRoutesByDriver(driverId: string): Promise<Route[]> {
    return this.routeRepository.find({
      where: { driverId },
      relations: ['stops'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async getRoutesByDate(date: Date): Promise<Route[]> {
    return this.routeRepository.find({
      where: { scheduledDate: date },
      relations: ['stops'],
    });
  }

  async getRoutesByStatus(status: RouteStatus): Promise<Route[]> {
    return this.routeRepository.find({
      where: { status },
      relations: ['stops'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async optimizeRoute(routeId: string): Promise<Route> {
    const route = await this.getRouteById(routeId);
    // Aquí se implementaría la lógica de optimización de rutas
    // Por ahora, solo ordenamos las paradas por secuencia
    route.stops.sort((a, b) => a.sequence - b.sequence);
    return this.routeRepository.save(route);
  }

  async getRouteMetrics() {
    const total = await this.routeRepository.count();
    const planned = await this.routeRepository.count({ where: { status: RouteStatus.PLANNED } });
    const inProgress = await this.routeRepository.count({ where: { status: RouteStatus.IN_PROGRESS } });
    const completed = await this.routeRepository.count({ where: { status: RouteStatus.COMPLETED } });
    const cancelled = await this.routeRepository.count({ where: { status: RouteStatus.CANCELLED } });

    return {
      total,
      planned,
      inProgress,
      completed,
      cancelled,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }
}
