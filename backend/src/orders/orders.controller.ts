import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto, UpdateOrderStatusDto, AssignDriverToOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const order = await this.ordersService.create(createOrderDto, req.user.id);
    this.ordersGateway.emitOrderCreated(order);
    return order;
  }

  @Get()
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.DRIVER)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('driverId') driverId?: string,
    @Request() req?,
  ) {
    const driverFilter = req.user.role === Role.DRIVER ? req.user.driverId : driverId;
    return this.ordersService.findAll(+page, +limit, status, search, driverFilter);
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  getStats() {
    return this.ordersService.getStats();
  }

  @Get('track/:orderNumber')
  @UseGuards(JwtAuthGuard)
  trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.DRIVER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req,
  ) {
    const order = await this.ordersService.updateStatus(id, dto, req.user.id);
    this.ordersGateway.emitOrderStatusUpdated(order);
    return order;
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.COORDINATOR)
  async assignDriver(
    @Param('id') id: string,
    @Body() dto: AssignDriverToOrderDto,
    @Request() req,
  ) {
    const order = await this.ordersService.assignDriver(id, dto, req.user.id);
    this.ordersGateway.emitOrderAssigned(order);
    return order;
  }

  @Get('driver/:driverId')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.DRIVER)
  getDriverOrders(@Param('driverId') driverId: string) {
    return this.ordersService.getDriverOrders(driverId);
  }
}
