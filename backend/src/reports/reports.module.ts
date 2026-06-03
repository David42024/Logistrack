import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsPublicController } from './reports.public.controller';
import { Order } from '../orders/entities/order.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Driver])],
  controllers: [ReportsController, ReportsPublicController],
  providers: [ReportsService],
})
export class ReportsModule {}
