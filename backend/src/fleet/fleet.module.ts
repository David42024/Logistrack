import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';
import { Vehicle } from './entities/vehicle.entity';
import { Maintenance } from './entities/maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Maintenance])],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}
