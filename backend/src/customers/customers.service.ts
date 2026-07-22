import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const where: any = search
      ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : undefined;

    const [data, total] = await this.customersRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(data: Partial<Customer>) {
    const customer = this.customersRepository.create(data);
    return this.customersRepository.save(customer);
  }

  async update(id: string, data: Partial<Customer>) {
    await this.customersRepository.update(id, data);
    return this.findOne(id);
  }

  async getCustomerOrders(customerId: string) {
    return this.ordersRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      relations: ['driver', 'history'],
    });
  }
}
