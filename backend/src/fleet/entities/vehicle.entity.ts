import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Maintenance } from './maintenance.entity';

export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

export enum VehicleType {
  TRUCK = 'truck',
  VAN = 'van',
  MOTORCYCLE = 'motorcycle',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plate: string;

  @Column({ type: 'enum', enum: VehicleType })
  type: VehicleType;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capacity: number;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.ACTIVE })
  status: VehicleStatus;

  @Column({ nullable: true })
  insuranceExpiry: Date;

  @Column({ nullable: true })
  itvExpiry: Date;

  @Column({ default: 0 })
  mileage: number;

  @OneToMany(() => Maintenance, (maintenance) => maintenance.vehicle)
  maintenance: Maintenance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
