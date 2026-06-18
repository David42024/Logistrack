import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { Maintenance, MaintenanceStatus } from './entities/maintenance.entity';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
  ) {}

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      relations: ['maintenance'],
      order: { createdAt: 'DESC' },
    });
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['maintenance'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(data);
    return this.vehicleRepository.save(vehicle);
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);
    Object.assign(vehicle, data);
    return this.vehicleRepository.save(vehicle);
  }

  async updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);
    vehicle.status = status;
    return this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(id: string): Promise<void> {
    const vehicle = await this.getVehicleById(id);
    await this.vehicleRepository.remove(vehicle);
  }

  async getActiveVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { status: VehicleStatus.ACTIVE },
      relations: ['maintenance'],
    });
  }

  async getVehiclesInMaintenance(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { status: VehicleStatus.MAINTENANCE },
      relations: ['maintenance'],
    });
  }

  async getMaintenanceByVehicle(vehicleId: string): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { vehicleId },
      order: { scheduledDate: 'DESC' },
    });
  }

  async createMaintenance(data: Partial<Maintenance>): Promise<Maintenance> {
    const maintenance = this.maintenanceRepository.create(data);
    return this.maintenanceRepository.save(maintenance);
  }

  async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({ where: { id } });
    if (!maintenance) {
      throw new NotFoundException('Maintenance not found');
    }
    Object.assign(maintenance, data);
    return this.maintenanceRepository.save(maintenance);
  }

  async getUpcomingMaintenance(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { status: MaintenanceStatus.SCHEDULED },
      relations: ['vehicle'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getFleetMetrics() {
    const total = await this.vehicleRepository.count();
    const active = await this.vehicleRepository.count({ where: { status: VehicleStatus.ACTIVE } });
    const maintenance = await this.vehicleRepository.count({ where: { status: VehicleStatus.MAINTENANCE } });
    const inactive = await this.vehicleRepository.count({ where: { status: VehicleStatus.INACTIVE } });
    const upcomingMaintenance = await this.maintenanceRepository.count({
      where: { status: MaintenanceStatus.SCHEDULED },
    });

    return {
      total,
      active,
      maintenance,
      inactive,
      upcomingMaintenance,
      utilizationRate: total > 0 ? ((active / total) * 100).toFixed(2) : 0,
    };
  }
}
