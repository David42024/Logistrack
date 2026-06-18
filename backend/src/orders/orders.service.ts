import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderHistory } from './entities/order-history.entity';
import { CreateOrderDto, UpdateOrderStatusDto, AssignDriverToOrderDto } from './dto/create-order.dto';
import { Driver, DriverStatus } from '../drivers/entities/driver.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderHistory)
    private historyRepository: Repository<OrderHistory>,
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const date = dayjs().format('YYYYMMDD');
    const count = await this.ordersRepository.count();
    const seq = String(count + 1).padStart(4, '0');
    return `ORD-${date}-${seq}`;
  }

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const orderNumber = await this.generateOrderNumber();
    const order = this.ordersRepository.create({
      ...createOrderDto,
      orderNumber,
      status: OrderStatus.PENDING,
    });
    const saved = await this.ordersRepository.save(order);

    await this.historyRepository.save({
      orderId: saved.id,
      previousStatus: null,
      newStatus: OrderStatus.PENDING,
      changedBy: userId,
      notes: 'Order created',
    });

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limit = 10, status?: string, search?: string, driverId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (driverId) where.driverId = driverId;

    const [data, total] = await this.ordersRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['customer', 'driver', 'history'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'driver', 'history'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.ordersRepository.findOne({
      where: { orderNumber },
      relations: ['customer', 'driver', 'history'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.findOne(id);

    if (dto.status === OrderStatus.CANCELLED && !dto.cancellationReason) {
      throw new BadRequestException('Cancellation reason is required');
    }

    const previousStatus = order.status;
    const updates: Partial<Order> = { status: dto.status };

    if (dto.cancellationReason) updates.cancellationReason = dto.cancellationReason;
    if (dto.status === OrderStatus.DELIVERED) updates.deliveredAt = new Date();

    await this.ordersRepository.update(id, updates);

    await this.historyRepository.save({
      orderId: id,
      previousStatus,
      newStatus: dto.status,
      changedBy: userId,
      notes: dto.notes || dto.cancellationReason,
      incidentImage: dto.incidentImage,
    });

    return this.findOne(id);
  }

  async assignDriver(id: string, dto: AssignDriverToOrderDto, userId: string) {
    const order = await this.findOne(id);
    const driver = await this.driversRepository.findOne({ where: { id: dto.driverId } });

    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new BadRequestException('Driver is not available');
    }

    const previousStatus = order.status;
    await this.ordersRepository.update(id, {
      driverId: dto.driverId,
      status: OrderStatus.PREPARING,
    });

    await this.historyRepository.save({
      orderId: id,
      previousStatus,
      newStatus: OrderStatus.PREPARING,
      changedBy: userId,
      notes: `Driver ${driver.name} assigned`,
    });

    await this.driversRepository.update(dto.driverId, { status: DriverStatus.BUSY });

    return this.findOne(id);
  }

  async getDriverOrders(driverId: string) {
    return this.ordersRepository.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
      relations: ['customer', 'history'],
    });
  }

  async getStats() {
    const today = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const [totalToday, deliveredToday, inTransit, incidents] = await Promise.all([
      this.ordersRepository.count({ where: {} }),
      this.ordersRepository
        .createQueryBuilder('o')
        .where('o.status = :s', { s: OrderStatus.DELIVERED })
        .andWhere('o.deliveredAt >= :from', { from: today })
        .andWhere('o.deliveredAt <= :to', { to: todayEnd })
        .getCount(),
      this.ordersRepository.count({ where: { status: OrderStatus.TRANSIT } }),
      this.historyRepository
        .createQueryBuilder('h')
        .where('h.incidentImage IS NOT NULL')
        .getCount(),
    ]);

    return { totalToday, deliveredToday, inTransit, incidents };
  }

  async addInciment(orderId: string, note: string, attachment?: string, userId?: string) {
    const order = await this.findOne(orderId);
    
    await this.historyRepository.save({
      orderId: order.id,
      previousStatus: order.status,
      newStatus: order.status,
      changedBy: userId,
      notes: note,
      incidentImage: attachment,
    });

    return this.findOne(orderId);
  }

  async addIncident(orderId: string, note: string, attachment?: string, userId?: string) {
    const order = await this.findOne(orderId);
    
    await this.historyRepository.save({
      orderId: order.id,
      previousStatus: order.status,
      newStatus: order.status,
      changedBy: userId,
      notes: note,
      incidentImage: attachment,
    });

    return this.findOne(orderId);
  }

  async getActiveIncidents() {
    const incidents = await this.historyRepository
      .createQueryBuilder('h')
      .where('h.incidentImage IS NOT NULL')
      .orderBy('h.createdAt', 'DESC')
      .limit(50)
      .getMany();

    const orderIds = [...new Set(incidents.map(i => i.orderId))];
    const orders = await this.ordersRepository.find({
      where: { id: { $in: orderIds } } as any,
      relations: ['customer', 'driver']
    });

    return incidents.map(incident => ({
      ...incident,
      order: orders.find(o => o.id === incident.orderId),
    }));
  }
}
