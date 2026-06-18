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

  async findAll(search?: string) {
    if (search) {
      return this.customersRepository.find({
        where: [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }],
      });
    }
    return this.customersRepository.find();
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
