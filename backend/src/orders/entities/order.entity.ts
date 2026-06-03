import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { OrderHistory } from './order-history.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  TRANSIT = 'transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true })
  @JoinColumn()
  customer: Customer;

  @Column()
  customerId: string;

  @ManyToOne(() => Driver, (driver) => driver.orders, { nullable: true, eager: true })
  @JoinColumn()
  driver: Driver;

  @Index()
  @Column({ nullable: true })
  driverId: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column()
  merchandiseType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true, type: 'text' })
  cancellationReason: string;

  @Column({ nullable: true })
  estimatedDate: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @OneToMany(() => OrderHistory, (history) => history.order, { eager: true })
  history: OrderHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
