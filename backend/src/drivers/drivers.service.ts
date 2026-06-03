import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
  ) {}

  async findAll() {
    return this.driversRepository.find({ relations: ['user'] });
  }

  async findAvailable() {
    return this.driversRepository.find({
      where: { status: DriverStatus.AVAILABLE },
      relations: ['user'],
    });
  }

  async findOne(id: string) {
    const driver = await this.driversRepository.findOne({
      where: { id },
      relations: ['user', 'orders'],
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async create(data: Partial<Driver>) {
    const driver = this.driversRepository.create(data);
    return this.driversRepository.save(driver);
  }

  async update(id: string, data: Partial<Driver>) {
    await this.driversRepository.update(id, data);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: DriverStatus) {
    await this.driversRepository.update(id, { status });
    return this.findOne(id);
  }

  async getSuggestedDriver() {
    // Suggest driver with least active orders
    const drivers = await this.driversRepository
      .createQueryBuilder('driver')
      .leftJoinAndSelect('driver.orders', 'order', "order.status NOT IN ('delivered', 'cancelled')")
      .where('driver.status = :status', { status: DriverStatus.AVAILABLE })
      .orderBy('COUNT(order.id)', 'ASC')
      .groupBy('driver.id')
      .getMany();

    return drivers[0] || null;
  }
}
