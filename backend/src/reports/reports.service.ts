import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Driver } from '../drivers/entities/driver.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
  ) {}

  async getKPIs() {
    const today = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const totalOrders = await this.ordersRepository.count();
    const deliveredToday = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .andWhere('o.deliveredAt >= :from', { from: today })
      .andWhere('o.deliveredAt <= :to', { to: todayEnd })
      .getCount();

    const inTransit = await this.ordersRepository.count({ where: { status: OrderStatus.TRANSIT } });
    const pending = await this.ordersRepository.count({ where: { status: OrderStatus.PENDING } });
    const deliveredTotal = await this.ordersRepository.count({ where: { status: OrderStatus.DELIVERED } });
    const cancelled = await this.ordersRepository.count({ where: { status: OrderStatus.CANCELLED } });

    // Average delivery time in minutes
    const avgDeliveryResult = await this.ordersRepository
      .createQueryBuilder('o')
      .select('AVG(EXTRACT(EPOCH FROM (o.deliveredAt - o.createdAt))/60)', 'avg')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .andWhere('o.deliveredAt IS NOT NULL')
      .getRawOne();
    const avgDeliveryTime = Math.round(parseFloat(avgDeliveryResult?.avg || '0'));

    // SLA compliance
    const slaResult = await this.ordersRepository
      .createQueryBuilder('o')
      .select('COUNT(o.id)', 'total')
      .addSelect('SUM(CASE WHEN o.deliveredAt <= o.estimatedDate THEN 1 ELSE 0 END)', 'onTime')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .getRawOne();
    const slaCompliance = slaResult?.total > 0 ? Math.round((slaResult.onTime / slaResult.total) * 100) : 95;

    // Success rate
    const totalFinished = deliveredTotal + cancelled;
    const successRate = totalFinished > 0 ? Math.round((deliveredTotal / totalFinished) * 100) : 98;

    // Avg delay (minutes)
    const avgDelayResult = await this.ordersRepository
      .createQueryBuilder('o')
      .select('AVG(EXTRACT(EPOCH FROM (o.deliveredAt - o.estimatedDate))/60)', 'avg')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .andWhere('o.deliveredAt > o.estimatedDate')
      .getRawOne();
    const avgDelay = avgDelayResult?.avg ? Math.round(parseFloat(avgDelayResult.avg)) : 5;

    return {
      totalOrders,
      deliveredToday,
      inTransit,
      pending,
      slaCompliance,
      avgDeliveryTime,
      successRate,
      avgDelay,
    };
  }

  async getLoginMetrics() {
    const today = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const activeOrders = await this.ordersRepository.count({
      where: [{ status: OrderStatus.PENDING }, { status: OrderStatus.PREPARING }, { status: OrderStatus.TRANSIT }],
    });
    const inTransit = await this.ordersRepository.count({ where: { status: OrderStatus.TRANSIT } });
    const ordersToday = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.createdAt >= :from', { from: today })
      .getCount();
    const deliveredToday = await this.ordersRepository
      .createQueryBuilder('o')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .andWhere('o.deliveredAt >= :from', { from: today })
      .andWhere('o.deliveredAt <= :to', { to: todayEnd })
      .getCount();
    const vehiclesInFleet = await this.driversRepository.count();
    const deliveryEfficiency = ordersToday
      ? Number(((deliveredToday / ordersToday) * 100).toFixed(1))
      : 0;

    return {
      activeOrders,
      inTransit,
      deliveryEfficiency,
      vehiclesInFleet,
    };
  }

  async getDeliveriesByDay(days = 7) {
    const results = [];
    const totalDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 7;
    for (let i = totalDays - 1; i >= 0; i--) {
      const day = dayjs().subtract(i, 'day');
      const from = day.startOf('day').toDate();
      const to = day.endOf('day').toDate();
      const count = await this.ordersRepository
        .createQueryBuilder('o')
        .where('o.status = :s', { s: OrderStatus.DELIVERED })
        .andWhere('o.deliveredAt >= :from', { from })
        .andWhere('o.deliveredAt <= :to', { to })
        .getCount();
      results.push({ date: day.format('DD/MM'), count });
    }
    return results;
  }

  async getTopDrivers() {
    return this.ordersRepository
      .createQueryBuilder('o')
      .select('o.driverId', 'driverId')
      .addSelect('COUNT(o.id)', 'deliveries')
      .leftJoin('o.driver', 'driver')
      .addSelect('driver.name', 'driverName')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .andWhere('o.driverId IS NOT NULL')
      .groupBy('o.driverId')
      .addGroupBy('driver.name')
      .orderBy('deliveries', 'DESC')
      .limit(3)
      .getRawMany();
  }

  async generatePdfReport(res: any) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const kpis = await this.getKPIs();
    const topDrivers = await this.getTopDrivers();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('Reporte de Sistema de Transporte', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`);
    doc.moveDown();

    doc.fontSize(16).text('KPIs Generales');
    doc.fontSize(12)
      .text(`Total de pedidos: ${kpis.totalOrders}`)
      .text(`Entregados hoy: ${kpis.deliveredToday}`)
      .text(`En tránsito: ${kpis.inTransit}`)
      .text(`Pendientes: ${kpis.pending}`)
      .text(`Tiempo promedio de entrega: ${kpis.avgDeliveryTime} min`)
      .text(`% Cumplimiento SLA: ${kpis.slaCompliance}%`)
      .text(`Tasa de éxito: ${kpis.successRate}%`);

    doc.moveDown();
    doc.fontSize(16).text('Top 3 Transportistas');
    topDrivers.forEach((d, i) => {
      doc.fontSize(12).text(`${i + 1}. ${d.driverName}: ${d.deliveries} entregas`);
    });

    doc.end();
  }

  async generateExcelReport(res: any) {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const kpis = await this.getKPIs();
    const deliveriesByDay = await this.getDeliveriesByDay();
    const topDrivers = await this.getTopDrivers();

    const sheet1 = workbook.addWorksheet('KPIs');
    sheet1.addRow(['Métrica', 'Valor']);
    sheet1.addRow(['Total pedidos', kpis.totalOrders]);
    sheet1.addRow(['Entregados hoy', kpis.deliveredToday]);
    sheet1.addRow(['En tránsito', kpis.inTransit]);
    sheet1.addRow(['Pendientes', kpis.pending]);
    sheet1.addRow(['Tiempo promedio (min)', kpis.avgDeliveryTime]);
    sheet1.addRow(['% Cumplimiento SLA', kpis.slaCompliance + '%']);
    sheet1.addRow(['Tasa de éxito', kpis.successRate + '%']);

    const sheet2 = workbook.addWorksheet('Entregas por día');
    sheet2.addRow(['Fecha', 'Entregas']);
    deliveriesByDay.forEach((d) => sheet2.addRow([d.date, d.count]));

    const sheet3 = workbook.addWorksheet('Top Transportistas');
    sheet3.addRow(['Transportista', 'Entregas']);
    topDrivers.forEach((d) => sheet3.addRow([d.driverName, d.deliveries]));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  }

  async getAnalytics() {
    const kpis = await this.getKPIs();
    const deliveriesByDay = await this.getDeliveriesByDay(30);
    const topDrivers = await this.getTopDrivers();

    const zoneDistribution = await this.ordersRepository
      .createQueryBuilder('o')
      .select('o.destination', 'zone')
      .addSelect('COUNT(o.id)', 'count')
      .where('o.status = :s', { s: OrderStatus.DELIVERED })
      .groupBy('o.destination')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      kpis,
      deliveriesByDay,
      topDrivers,
      zoneDistribution: zoneDistribution.map(z => ({
        zone: z.zone,
        count: parseInt(z.count),
      })),
    };
  }

  async getIncidentsByDay(days = 7) {
    const results = [];
    const totalDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 7;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const day = dayjs().subtract(i, 'day');
      const from = day.startOf('day').toDate();
      const to = day.endOf('day').toDate();
      
      // Count orders with incidents (orders that have history with incident notes or images)
      const count = await this.ordersRepository
        .createQueryBuilder('o')
        .leftJoin('o.history', 'h')
        .where('o.createdAt >= :from', { from })
        .andWhere('o.createdAt <= :to', { to })
        .andWhere('(h.incidentImage IS NOT NULL OR (h.notes IS NOT NULL AND h.notes != :empty))', { empty: '' })
        .getCount();
      
      results.push({ date: day.format('DD/MM'), count });
    }
    
    return results;
  }

  async getAvgTimeByDay(days = 7) {
    const results = [];
    const totalDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 7;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const day = dayjs().subtract(i, 'day');
      const from = day.startOf('day').toDate();
      const to = day.endOf('day').toDate();
      
      // Calculate average delivery time for delivered orders on this day
      const result = await this.ordersRepository
        .createQueryBuilder('o')
        .select('AVG(EXTRACT(EPOCH FROM (o.deliveredAt - o.createdAt))/60)', 'avgTime')
        .where('o.status = :s', { s: OrderStatus.DELIVERED })
        .andWhere('o.deliveredAt >= :from', { from })
        .andWhere('o.deliveredAt <= :to', { to })
        .andWhere('o.deliveredAt IS NOT NULL')
        .getRawOne();
      
      const avgTime = result?.avgTime ? parseFloat(result.avgTime).toFixed(1) : '0';
      results.push({ date: day.format('DD/MM'), avgTime: parseFloat(avgTime) });
    }
    
    return results;
  }

  async getActiveOrdersByDay(days = 7) {
    const results = [];
    const totalDays = Number.isFinite(days) && days > 0 ? Math.min(days, 30) : 7;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const day = dayjs().subtract(i, 'day');
      const from = day.startOf('day').toDate();
      const to = day.endOf('day').toDate();
      
      // Count orders that were active (pending, preparing, or transit) on this day
      const count = await this.ordersRepository
        .createQueryBuilder('o')
        .where('o.createdAt <= :to', { to })
        .andWhere('(o.deliveredAt >= :from OR o.deliveredAt IS NULL)', { from })
        .andWhere('o.status IN (:...statuses)', { 
          statuses: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.TRANSIT] 
        })
        .getCount();
      
      results.push({ date: day.format('DD/MM'), count });
    }
    
    return results;
  }
}
