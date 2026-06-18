import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RouteStop } from './route-stop.entity';

export enum RouteStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.PLANNED })
  status: RouteStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDistance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedDuration: number;

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ nullable: true })
  driverId: string;

  @Column({ default: 0 })
  ordersCount: number;

  @OneToMany(() => RouteStop, (stop) => stop.route, { cascade: true })
  stops: RouteStop[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
