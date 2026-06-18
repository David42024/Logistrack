import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Route } from './route.entity';

export enum StopStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('route_stops')
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sequence: number;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'enum', enum: StopStatus, default: StopStatus.PENDING })
  status: StopStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedArrival: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  distanceFromPrevious: number;

  @Column({ nullable: true })
  notes: string;

  @Column()
  routeId: string;

  @ManyToOne(() => Route, (route) => route.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
