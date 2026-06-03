import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_history')
export class OrderHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.history)
  @JoinColumn()
  order: Order;

  @Column()
  orderId: string;

  @Column({ nullable: true })
  previousStatus: string;

  @Column()
  newStatus: string;

  @Column({ nullable: true })
  changedBy: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  incidentImage: string;

  @CreateDateColumn()
  createdAt: Date;
}
