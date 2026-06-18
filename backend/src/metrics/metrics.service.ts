import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
  ) {}

  async getPublicMetrics() {
    const totalOrders = await this.ordersRepository.count();
    const activeOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.TRANSIT },
    });
    const totalDrivers = await this.driversRepository.count();
    const availableDrivers = await this.driversRepository.count({
      where: { status: DriverStatus.AVAILABLE },
    });

    return {
      pedidosActivos: activeOrders,
      rutasActivas: activeOrders,
      eficiencia: totalOrders > 0 ? ((activeOrders / totalOrders) * 100).toFixed(1) : '0',
      flota: `${availableDrivers}/${totalDrivers}`,
    };
  }

  async getHistoricalMetrics(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :startDate', { startDate })
      .orderBy('order.createdAt', 'ASC')
      .getMany();

    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = orders.filter(
        (order) => order.createdAt.toISOString().split('T')[0] === dateStr,
      );

      dailyData.push({
        fecha: dateStr,
        pedidos: dayOrders.length,
        entregados: dayOrders.filter((o) => o.status === OrderStatus.DELIVERED).length,
        cancelados: dayOrders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      });
    }

    return dailyData;
  }
}
