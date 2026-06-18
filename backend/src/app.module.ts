import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { DriversModule } from './drivers/drivers.module';
import { CustomersModule } from './customers/customers.module';
import { ReportsModule } from './reports/reports.module';
import { MetricsModule } from './metrics/metrics.module';
import { FleetModule } from './fleet/fleet.module';
import { RoutesModule } from './routes/routes.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { OrderHistory } from './orders/entities/order-history.entity';
import { Driver } from './drivers/entities/driver.entity';
import { Customer } from './customers/entities/customer.entity';
import { Vehicle } from './fleet/entities/vehicle.entity';
import { Maintenance } from './fleet/entities/maintenance.entity';
import { Route } from './routes/entities/route.entity';
import { RouteStop } from './routes/entities/route-stop.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USER', 'transport_user'),
        password: configService.get('DB_PASSWORD', 'transport_pass'),
        database: configService.get('DB_NAME', 'transport_db'),
        entities: [User, Order, OrderHistory, Driver, Customer, Vehicle, Maintenance, Route, RouteStop],
        synchronize: true,
        autoLoadEntities: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    DriversModule,
    CustomersModule,
    ReportsModule,
    MetricsModule,
    FleetModule,
    RoutesModule,
  ],
})
export class AppModule {}
