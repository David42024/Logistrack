import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './users/entities/user.entity';
import { Driver, DriverStatus } from './drivers/entities/driver.entity';
import { Customer } from './customers/entities/customer.entity';
import { Order, OrderStatus } from './orders/entities/order.entity';
import { OrderHistory } from './orders/entities/order-history.entity';
import { Vehicle, VehicleType, VehicleStatus } from './fleet/entities/vehicle.entity';
import { Maintenance, MaintenanceType, MaintenanceStatus } from './fleet/entities/maintenance.entity';
import { Route, RouteStatus } from './routes/entities/route.entity';
import { RouteStop, StopStatus } from './routes/entities/route-stop.entity';
import { Role } from './common/enums/role.enum';

/** Contraseña única para todos los usuarios de prueba */
const SEED_PASSWORD = 'Admin123!';

/** Genera un hash bcrypt sincrónico para la contraseña semilla */
function hashPassword(): string {
  return bcrypt.hashSync(SEED_PASSWORD, 10);
}

export async function runSeed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const driverRepo = dataSource.getRepository(Driver);
  const customerRepo = dataSource.getRepository(Customer);
  const orderRepo = dataSource.getRepository(Order);
  const historyRepo = dataSource.getRepository(OrderHistory);
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const maintenanceRepo = dataSource.getRepository(Maintenance);
  const routeRepo = dataSource.getRepository(Route);
  const stopRepo = dataSource.getRepository(RouteStop);

  await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  const hashedPassword = hashPassword();

  // ═══════════════════════════════════════════════════════════════════
  // 1. USUARIOS (25) — contraseña global: Admin123!
  // ═══════════════════════════════════════════════════════════════════
  const usersData = [
    // — Admins —
    { email: 'admin@transporte.com', name: 'Admin Principal', role: Role.ADMIN, isActive: true },
    { email: 'admin2@transporte.com', name: 'Admin de Sistemas', role: Role.ADMIN, isActive: true },
    // — Coordinadores —
    { email: 'coord1@transporte.com', name: 'Lucía Fernández', role: Role.COORDINATOR, isActive: true },
    { email: 'coord2@transporte.com', name: 'Pedro Gutiérrez', role: Role.COORDINATOR, isActive: true },
    { email: 'coord3@transporte.com', name: 'Carmen Huamán', role: Role.COORDINATOR, isActive: true },
    // — Operadores —
    { email: 'oper1@transporte.com', name: 'Jorge Castillo', role: Role.OPERATOR, isActive: true },
    { email: 'oper2@transporte.com', name: 'Rosa Morales', role: Role.OPERATOR, isActive: true },
    { email: 'oper3@transporte.com', name: 'Luis Vargas', role: Role.OPERATOR, isActive: true },
    { email: 'oper4@transporte.com', name: 'Ana Quispe', role: Role.OPERATOR, isActive: true },
    // — Gerentes —
    { email: 'manager@transporte.com', name: 'Diego Paredes', role: Role.MANAGER, isActive: true },
    { email: 'manager2@transporte.com', name: 'Silvia Ríos', role: Role.MANAGER, isActive: true },
    // — Transportistas (12 conductores con cuenta) —
    { email: 'driver1@transporte.com', name: 'Carlos Rodríguez', role: Role.DRIVER, isActive: true },
    { email: 'driver2@transporte.com', name: 'María Torres', role: Role.DRIVER, isActive: true },
    { email: 'driver3@transporte.com', name: 'José Mendoza', role: Role.DRIVER, isActive: true },
    { email: 'driver4@transporte.com', name: 'Miguel Sánchez', role: Role.DRIVER, isActive: true },
    { email: 'driver5@transporte.com', name: 'Laura Jiménez', role: Role.DRIVER, isActive: true },
    { email: 'driver6@transporte.com', name: 'Raúl Castro', role: Role.DRIVER, isActive: true },
    { email: 'driver7@transporte.com', name: 'Patricia Flores', role: Role.DRIVER, isActive: true },
    { email: 'driver8@transporte.com', name: 'Fernando Rojas', role: Role.DRIVER, isActive: true },
    { email: 'driver9@transporte.com', name: 'Diana Aguilar', role: Role.DRIVER, isActive: true },
    { email: 'driver10@transporte.com', name: 'Héctor Delgado', role: Role.DRIVER, isActive: true },
    { email: 'driver11@transporte.com', name: 'Gabriela Campos', role: Role.DRIVER, isActive: true },
    { email: 'driver12@transporte.com', name: 'Alberto Vega', role: Role.DRIVER, isActive: true },
    // — Clientes con cuenta —
    { email: 'cliente.corp@transporte.com', name: 'Enrique Mejía', role: Role.CUSTOMER, isActive: true },
    { email: 'cliente.mayor@transporte.com', name: 'Sofía Távara', role: Role.CUSTOMER, isActive: true },
  ];

  const emailToUserMap: Record<string, User> = {};
  for (const u of usersData) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      user = userRepo.create({ ...u, password: hashedPassword });
      user = await userRepo.save(user);
      console.log(`  ✓ Usuario: ${u.email} (${u.name})`);
    }
    emailToUserMap[u.email] = user;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. TRANSPORTISTAS (25: los 12 con cuenta + 13 independientes)
  // ═══════════════════════════════════════════════════════════════════
  const driverUsers = [
    { email: 'driver1@transporte.com', phone: '+51 987 654 321', lic: 'LIC-001-PE', vehType: 'Camión 8T', plate: 'ABC-123' },
    { email: 'driver2@transporte.com', phone: '+51 976 543 210', lic: 'LIC-002-PE', vehType: 'Furgón', plate: 'XYZ-456' },
    { email: 'driver3@transporte.com', phone: '+51 965 432 109', lic: 'LIC-003-PE', vehType: 'Camioneta', plate: 'DEF-789' },
    { email: 'driver4@transporte.com', phone: '+51 954 321 098', lic: 'LIC-004-PE', vehType: 'Camión 5T', plate: 'GHI-012' },
    { email: 'driver5@transporte.com', phone: '+51 943 210 987', lic: 'LIC-005-PE', vehType: 'Furgón Refrig.', plate: 'JKL-345' },
    { email: 'driver6@transporte.com', phone: '+51 932 109 876', lic: 'LIC-006-PE', vehType: 'Moto Carga', plate: 'MNO-678' },
    { email: 'driver7@transporte.com', phone: '+51 921 098 765', lic: 'LIC-007-PE', vehType: 'Camión 10T', plate: 'PQR-901' },
    { email: 'driver8@transporte.com', phone: '+51 910 987 654', lic: 'LIC-008-PE', vehType: 'Furgón', plate: 'STU-234' },
    { email: 'driver9@transporte.com', phone: '+51 909 876 543', lic: 'LIC-009-PE', vehType: 'Camioneta', plate: 'VWX-567' },
    { email: 'driver10@transporte.com', phone: '+51 898 765 432', lic: 'LIC-010-PE', vehType: 'Camión 5T', plate: 'YZA-890' },
    { email: 'driver11@transporte.com', phone: '+51 887 654 321', lic: 'LIC-011-PE', vehType: 'Furgón Refrig.', plate: 'BCD-123' },
    { email: 'driver12@transporte.com', phone: '+51 876 543 210', lic: 'LIC-012-PE', vehType: 'Moto Carga', plate: 'EFG-456' },
  ];

  // 13 conductores independientes (sin cuenta de usuario)
  const independentDrivers = [
    { name: 'Roberto Guzmán', phone: '+51 965 111 222', lic: 'LIC-013-PE', vehType: 'Camión 8T', plate: 'HIJ-789' },
    { name: 'Elena Pizarro', phone: '+51 965 222 333', lic: 'LIC-014-PE', vehType: 'Furgón', plate: 'KLM-012' },
    { name: 'Víctor Tapia', phone: '+51 965 333 444', lic: 'LIC-015-PE', vehType: 'Camioneta', plate: 'NOP-345' },
    { name: 'Claudia Salazar', phone: '+51 965 444 555', lic: 'LIC-016-PE', vehType: 'Camión 5T', plate: 'QRS-678' },
    { name: 'Sergio Linares', phone: '+51 965 555 666', lic: 'LIC-017-PE', vehType: 'Furgón Refrig.', plate: 'TUV-901' },
    { name: 'Ruth Meza', phone: '+51 965 666 777', lic: 'LIC-018-PE', vehType: 'Moto Carga', plate: 'WXY-234' },
    { name: 'Oscar Pacheco', phone: '+51 965 777 888', lic: 'LIC-019-PE', vehType: 'Camión 10T', plate: 'ZAB-567' },
    { name: 'Nadia León', phone: '+51 965 888 999', lic: 'LIC-020-PE', vehType: 'Furgón', plate: 'CDE-890' },
    { name: 'Tomás Huerta', phone: '+51 965 999 000', lic: 'LIC-021-PE', vehType: 'Camioneta', plate: 'FGH-123' },
    { name: 'Irene Soto', phone: '+51 964 111 222', lic: 'LIC-022-PE', vehType: 'Camión 5T', plate: 'IJK-456' },
    { name: 'Mario Cárdenas', phone: '+51 964 222 333', lic: 'LIC-023-PE', vehType: 'Furgón Refrig.', plate: 'LMN-789' },
    { name: 'Verónica Palma', phone: '+51 964 333 444', lic: 'LIC-024-PE', vehType: 'Moto Carga', plate: 'OPQ-012' },
    { name: 'Javier Beltrán', phone: '+51 964 444 555', lic: 'LIC-025-PE', vehType: 'Camión 8T', plate: 'RST-345' },
  ];

  const driverStatuses = [DriverStatus.AVAILABLE, DriverStatus.AVAILABLE, DriverStatus.BUSY, DriverStatus.BUSY, DriverStatus.OFFLINE];

  const allDriverRecords: Driver[] = [];

  for (const du of driverUsers) {
    const existing = await driverRepo.findOne({ where: { licenseNumber: du.lic } });
    if (existing) { allDriverRecords.push(existing); continue; }
    const user = emailToUserMap[du.email];
    const d = driverRepo.create({
      name: user.name, phone: du.phone, licenseNumber: du.lic,
      vehicleType: du.vehType, vehiclePlate: du.plate,
      status: driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
      userId: user.id, user,
    });
    const saved = await driverRepo.save(d);
    allDriverRecords.push(saved);
    console.log(`  ✓ Conductor: ${user.name}`);
  }

  for (const id of independentDrivers) {
    const existing = await driverRepo.findOne({ where: { licenseNumber: id.lic } });
    if (existing) { allDriverRecords.push(existing); continue; }
    const d = driverRepo.create({
      name: id.name, phone: id.phone, licenseNumber: id.lic,
      vehicleType: id.vehType, vehiclePlate: id.plate,
      status: driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
    });
    const saved = await driverRepo.save(d);
    allDriverRecords.push(saved);
    console.log(`  ✓ Conductor independiente: ${id.name}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. CLIENTES (30) — Empresas realistas peruanas
  // ═══════════════════════════════════════════════════════════════════
  const customersData = [
    // Grandes empresas
    { name: 'Corporación Alimentaria del Norte S.A.C.', email: 'ventas@corp-alimentos.pe', phone: '+51 044 201000', address: 'Av. Industrial 1500, Trujillo' },
    { name: 'Distribuidora Santa Anita E.I.R.L.', email: 'pedidos@dsantaanita.com', phone: '+51 01 5482001', address: 'Jr. Las Magnolias 320, Ate, Lima' },
    { name: 'Fábrica de Calzados El Dorado S.A.C.', email: 'compras@calzadoseldorado.pe', phone: '+51 044 301200', address: 'Calle Los Olivos 400, La Libertad' },
    { name: 'Agroexportaciones del Sur S.A.', email: 'logistica@agrosur.pe', phone: '+51 054 411222', address: 'Carretera Panamericana Sur Km 245, Ica' },
    { name: 'Inversiones Marítimas del Pacífico S.A.C.', email: 'ops@impac.pe', phone: '+51 01 6254000', address: 'Av. Grau 850, Callao' },
    // Medianas empresas
    { name: 'Tecnología y Suministros E.I.R.L.', email: 'ventas@tecnosuministros.pe', phone: '+51 01 7151234', address: 'Av. Arequipa 2450, Lince, Lima' },
    { name: 'Distribuidora de Abarrotes Los Andes', email: 'pedidos@andesdist.pe', phone: '+51 044 285000', address: 'Jr. Junín 512, Trujillo' },
    { name: 'Embotelladora Tropical del Perú S.A.C.', email: 'logistica@tropical.pe', phone: '+51 01 3502020', address: 'Panamericana Norte Km 30, Puente Piedra' },
    { name: 'Comercializadora de Frutos del Valle', email: 'ventas@frutosvalle.pe', phone: '+51 044 278123', address: 'Av. España 780, Trujillo' },
    { name: 'Metal Mecánica Industrial S.A.C.', email: 'compras@metmecanica.pe', phone: '+51 01 5617890', address: 'Carretera Central Km 12, Santa Anita' },
    { name: 'Grupo Constructor del Norte S.A.', email: 'logistica@grupoconstructor.pe', phone: '+51 044 234567', address: 'Av. América Sur 1234, Trujillo' },
    { name: 'Laboratorios Farmacéuticos Unión', email: 'ops@labunion.pe', phone: '+51 01 4567890', address: 'Av. Colonial 2150, Cercado de Lima' },
    { name: 'Distribuidora de GLP El Gas Perú', email: 'pedidos@elgasperu.pe', phone: '+51 01 7890123', address: 'Av. Argentina 3200, Callao' },
    { name: 'Productos Lácteos Los Valles', email: 'ventas@lacteosvalles.pe', phone: '+51 044 345678', address: 'Fundo Los Valles s/n, Virú, La Libertad' },
    { name: 'Industria Textil del Centro S.A.C.', email: 'compras@textilcentro.pe', phone: '+51 064 412345', address: 'Av. Industrial 500, Huancayo' },
    // Pequeñas empresas y comercios
    { name: 'Bodega Mayorista El Economico', email: 'el_economico@yahoo.pe', phone: '+51 965 123 456', address: 'Jr. Puno 320, Trujillo' },
    { name: 'Restaurante Turístico Don Ceviche', email: 'donceviche@gmail.com', phone: '+51 044 267890', address: 'Malecón Grau 180, Huanchaco' },
    { name: 'Panadería Artesanal El Trigo Feliz', email: 'pedidos@trigofeliz.pe', phone: '+51 976 543 210', address: 'Av. Larco 750, Trujillo' },
    { name: 'Ferretería El Constructor', email: 'ferreconstru@hotmail.com', phone: '+51 044 212345', address: 'Av. del Ejército 900, Trujillo' },
    { name: 'MiniMarket Mi Barrio', email: 'mibarrio@outlook.pe', phone: '+51 944 567 890', address: 'Calle Los Rosales 150, Vista Alegre' },
    { name: 'Carnicería Don Pedro', email: 'donpedro@carnes.pe', phone: '+51 933 456 789', address: 'Mercado Central Puesto 45, Trujillo' },
    { name: 'Librería y Útiles Escolares El Saber', email: 'elsaber@libros.pe', phone: '+51 044 256789', address: 'Jr. San Martín 600, Trujillo' },
    { name: 'Taller Mecánico Rápidos y Furiosos', email: 'ryf@taller.pe', phone: '+51 922 345 678', address: 'Av. Miraflores 230, Trujillo' },
    { name: 'Farmacia Salud Total', email: 'saludtotal@farma.pe', phone: '+51 044 278900', address: 'Av. España 550, Trujillo' },
    { name: 'Distribuidora de Golosinas Dulce Sur', email: 'dulcesur@pedidos.pe', phone: '+51 911 234 567', address: 'Jr. Unión 200, Trujillo' },
    { name: 'Tienda de Ropa Fashion Center', email: 'fashion@moda.pe', phone: '+51 044 234500', address: 'Av. Juan Pablo II 880, Trujillo' },
    { name: 'Vivero El Jardín Secreto', email: 'jardinsecreto@plantas.pe', phone: '+51 900 123 456', address: 'Carretera a Huanchaco Km 5, Trujillo' },
    { name: 'Gimnasio Fit & Strong', email: 'fitstrong@gym.pe', phone: '+51 044 245600', address: 'Av. América Oeste 650, Trujillo' },
    { name: 'Agencia de Viajes Destinos Perú', email: 'reservas@destinosperu.pe', phone: '+51 044 208800', address: 'Jr. Gamarra 300, Trujillo' },
    { name: 'Clínica Veterinaria Mascotas Felices', email: 'veterinaria@mascotas.pe', phone: '+51 044 234100', address: 'Av. Del Golf 120, Trujillo' },
  ];

  const customerRecords: Customer[] = [];
  for (const c of customersData) {
    let customer = await customerRepo.findOne({ where: { email: c.email } });
    if (!customer) {
      customer = customerRepo.create(c);
      customer = await customerRepo.save(customer);
      console.log(`  ✓ Cliente: ${c.name}`);
    }
    customerRecords.push(customer);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. VEHÍCULOS (25)
  // ═══════════════════════════════════════════════════════════════════
  const vehiclesData = [
    { plate: 'ABC-123', type: VehicleType.TRUCK, model: 'Volvo FH 460', year: 2023, capacity: 18000, status: VehicleStatus.ACTIVE, insurance: '2026-12-31', itv: '2026-06-15', mileage: 45200 },
    { plate: 'XYZ-456', type: VehicleType.TRUCK, model: 'Scania R500', year: 2022, capacity: 20000, status: VehicleStatus.ACTIVE, insurance: '2026-10-20', itv: '2026-04-10', mileage: 81200 },
    { plate: 'DEF-789', type: VehicleType.VAN, model: 'Mercedes Sprinter 416', year: 2023, capacity: 3500, status: VehicleStatus.ACTIVE, insurance: '2027-01-15', itv: '2026-08-22', mileage: 28100 },
    { plate: 'GHI-012', type: VehicleType.TRUCK, model: 'Freightliner M2 106', year: 2021, capacity: 12000, status: VehicleStatus.MAINTENANCE, insurance: '2026-09-01', itv: '2026-03-18', mileage: 124500 },
    { plate: 'JKL-345', type: VehicleType.VAN, model: 'Ford Transit 350', year: 2024, capacity: 2800, status: VehicleStatus.ACTIVE, insurance: '2027-04-01', itv: '2027-02-10', mileage: 8500 },
    { plate: 'MNO-678', type: VehicleType.MOTORCYCLE, model: 'Honda CB 190', year: 2023, capacity: 200, status: VehicleStatus.ACTIVE, insurance: '2026-11-30', itv: '2026-05-25', mileage: 15300 },
    { plate: 'PQR-901', type: VehicleType.TRUCK, model: 'International ProStar', year: 2020, capacity: 22000, status: VehicleStatus.INACTIVE, insurance: '2025-12-31', itv: '2026-01-10', mileage: 215000 },
    { plate: 'STU-234', type: VehicleType.VAN, model: 'Toyota Hiace', year: 2022, capacity: 1800, status: VehicleStatus.ACTIVE, insurance: '2026-08-15', itv: '2026-02-28', mileage: 52300 },
    { plate: 'VWX-567', type: VehicleType.VAN, model: 'Nissan NV350', year: 2023, capacity: 2000, status: VehicleStatus.ACTIVE, insurance: '2027-03-10', itv: '2026-09-05', mileage: 34100 },
    { plate: 'YZA-890', type: VehicleType.TRUCK, model: 'Hino 700 Series', year: 2022, capacity: 16000, status: VehicleStatus.ACTIVE, insurance: '2026-12-01', itv: '2026-06-30', mileage: 67300 },
    { plate: 'BCD-123', type: VehicleType.VAN, model: 'Renault Master', year: 2023, capacity: 2200, status: VehicleStatus.MAINTENANCE, insurance: '2027-02-20', itv: '2026-10-15', mileage: 19800 },
    { plate: 'EFG-456', type: VehicleType.MOTORCYCLE, model: 'Yamaha FZ 150', year: 2024, capacity: 180, status: VehicleStatus.ACTIVE, insurance: '2027-05-01', itv: '2027-01-20', mileage: 6400 },
    { plate: 'HIJ-789', type: VehicleType.TRUCK, model: 'Volvo VM 270', year: 2021, capacity: 14000, status: VehicleStatus.ACTIVE, insurance: '2026-07-31', itv: '2026-02-14', mileage: 98700 },
    { plate: 'KLM-012', type: VehicleType.VAN, model: 'Peugeot Boxer', year: 2024, capacity: 2500, status: VehicleStatus.ACTIVE, insurance: '2027-06-01', itv: '2027-03-15', mileage: 5200 },
    { plate: 'NOP-345', type: VehicleType.TRUCK, model: 'Kenworth T800', year: 2020, capacity: 25000, status: VehicleStatus.MAINTENANCE, insurance: '2026-05-30', itv: '2026-01-05', mileage: 189000 },
    { plate: 'QRS-678', type: VehicleType.MOTORCYCLE, model: 'Suzuki Gixxer 150', year: 2023, capacity: 150, status: VehicleStatus.ACTIVE, insurance: '2026-09-30', itv: '2026-04-20', mileage: 11200 },
    { plate: 'TUV-901', type: VehicleType.TRUCK, model: 'Mercedes Atego 1517', year: 2022, capacity: 15000, status: VehicleStatus.ACTIVE, insurance: '2026-11-15', itv: '2026-05-10', mileage: 54200 },
    { plate: 'WXY-234', type: VehicleType.VAN, model: 'Fiat Ducato', year: 2021, capacity: 2100, status: VehicleStatus.ACTIVE, insurance: '2026-10-01', itv: '2026-04-01', mileage: 67800 },
    { plate: 'ZAB-567', type: VehicleType.TRUCK, model: 'Volvo FH 420', year: 2023, capacity: 19000, status: VehicleStatus.ACTIVE, insurance: '2027-02-28', itv: '2026-08-20', mileage: 31500 },
    { plate: 'CDE-890', type: VehicleType.VAN, model: 'VW Crafter 50', year: 2024, capacity: 3200, status: VehicleStatus.ACTIVE, insurance: '2027-04-15', itv: '2027-01-01', mileage: 9800 },
    { plate: 'FGH-123', type: VehicleType.MOTORCYCLE, model: 'Bajaj Pulsar NS 200', year: 2023, capacity: 200, status: VehicleStatus.ACTIVE, insurance: '2026-12-15', itv: '2026-07-10', mileage: 8700 },
    { plate: 'IJK-456', type: VehicleType.TRUCK, model: 'Isuzu NPR 75K', year: 2022, capacity: 8000, status: VehicleStatus.ACTIVE, insurance: '2026-08-31', itv: '2026-03-01', mileage: 41200 },
    { plate: 'LMN-789', type: VehicleType.VAN, model: 'Chevrolet N300', year: 2023, capacity: 1200, status: VehicleStatus.ACTIVE, insurance: '2026-10-31', itv: '2026-06-15', mileage: 22300 },
    { plate: 'OPQ-012', type: VehicleType.TRUCK, model: 'MAN TGS 18.440', year: 2024, capacity: 17000, status: VehicleStatus.ACTIVE, insurance: '2027-07-01', itv: '2027-04-05', mileage: 4200 },
    { plate: 'RST-345', type: VehicleType.MOTORCYCLE, model: 'TVS Apache RTR 160', year: 2022, capacity: 160, status: VehicleStatus.INACTIVE, insurance: '2025-10-31', itv: '2025-12-01', mileage: 26500 },
  ];

  const vehicleRecords: Vehicle[] = [];
  for (const v of vehiclesData) {
    let vehicle = await vehicleRepo.findOne({ where: { plate: v.plate } });
    if (!vehicle) {
      vehicle = vehicleRepo.create({
        plate: v.plate, type: v.type, model: v.model, year: v.year, capacity: v.capacity,
        status: v.status, insuranceExpiry: v.insurance, itvExpiry: v.itv, mileage: v.mileage,
      });
      vehicle = await vehicleRepo.save(vehicle);
      console.log(`  ✓ Vehículo: ${v.plate} (${v.model})`);
    }
    vehicleRecords.push(vehicle);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. PEDIDOS (35)
  // ═══════════════════════════════════════════════════════════════════
  const now = new Date();
  const daysAgo = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); return dt; };

  const orderStatuses: OrderStatus[] = [
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
    OrderStatus.DELIVERED, OrderStatus.TRANSIT, OrderStatus.TRANSIT, OrderStatus.TRANSIT,
    OrderStatus.TRANSIT, OrderStatus.TRANSIT, OrderStatus.PREPARING, OrderStatus.PREPARING,
    OrderStatus.PREPARING, OrderStatus.PENDING, OrderStatus.PENDING, OrderStatus.PENDING,
    OrderStatus.PENDING, OrderStatus.PENDING, OrderStatus.CANCELLED, OrderStatus.CANCELLED,
    OrderStatus.TRANSIT, OrderStatus.TRANSIT, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
    OrderStatus.DELIVERED, OrderStatus.PREPARING, OrderStatus.PENDING, OrderStatus.PENDING,
    OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.TRANSIT,
  ];

  const origins = [
    'Av. Industrial 1500, Trujillo', 'Jr. Las Magnolias 320, Ate, Lima', 'Av. Arequipa 2450, Lince, Lima',
    'Panamericana Norte Km 30, Puente Piedra', 'Av. Argentina 3200, Callao', 'Carretera Central Km 12, Santa Anita',
    'Av. Colonial 2150, Cercado de Lima', 'Av. Grau 850, Callao',
  ];
  const destinations = [
    'Jr. Junín 512, Trujillo', 'Av. España 780, Trujillo', 'Av. América Sur 1234, Trujillo',
    'Malecón Grau 180, Huanchaco', 'Av. del Golf 120, Trujillo', 'Av. Miraflores 230, Trujillo',
    'Fundo Los Valles s/n, Virú', 'Carretera a Huanchaco Km 5', 'Av. Juan Pablo II 880, Trujillo',
    'Mercado Central Puesto 45, Trujillo', 'Jr. Gamarra 300, Trujillo', 'Av. Larco 750, Trujillo',
  ];
  const merchandise = [
    'Productos alimenticios varios', 'Material de construcción', 'Bebidas y gaseosas',
    'Equipos electrónicos', 'Textiles y confecciones', 'Productos farmacéuticos',
    'Repuestos automotrices', 'Abarrotes al por mayor', 'Frutas y verduras frescas',
    'Lácteos y derivados', 'Material de oficina', 'Calzado y accesorios',
    'Productos de limpieza', 'Equipo de gimnasio', 'Medicamentos controlados',
    'Envases y embalajes', 'Herramientas industriales', 'Ropa deportiva',
    'Conservas y enlatados', 'Carnes frías y embutidos', 'Artículos de ferretería',
    'Productos congelados', 'Celulares y accesorios', 'Muebles de oficina',
    'Útiles escolares', 'Juguetes didácticos', 'Alimento para mascotas',
    'Electrodomésticos línea blanca', 'Vidrios y espejos', 'LLantas y neumáticos',
    'Pinturas y solventes', 'Cajas de regalo surtidas', 'Papeles y cartones reciclados',
    'Instrumentos musicales', 'Artículos de bazar',
  ];

  const orderRecords: Order[] = [];
  const orderNumberSet = new Set<string>();

  for (let i = 0; i < 35; i++) {
    const customer = customerRecords[i % customerRecords.length];
    const status = orderStatuses[i];
    const createdDate = daysAgo(Math.floor(Math.random() * 25) + 1);
    const isAssigned = status === OrderStatus.TRANSIT || status === OrderStatus.DELIVERED || status === OrderStatus.PREPARING;
    const driver = isAssigned ? allDriverRecords[i % allDriverRecords.length] : null;

    // Fecha estimada entre 1 y 5 días después de creado
    const estimatedDate = new Date(createdDate);
    estimatedDate.setDate(estimatedDate.getDate() + Math.floor(Math.random() * 5) + 1);

    let deliveredAt: Date | null = null;
    if (status === OrderStatus.DELIVERED) {
      deliveredAt = new Date(estimatedDate);
      deliveredAt.setHours(deliveredAt.getHours() + Math.floor(Math.random() * 8) + 2);
    }

    // Número de orden único ORD-YYYYMMDD-XXXX
    let orderNumber: string;
    do {
      const dateStr = createdDate.toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(i + 1).padStart(4, '0');
      orderNumber = `ORD-${dateStr}-${seq}`;
    } while (orderNumberSet.has(orderNumber));
    orderNumberSet.add(orderNumber);

    const order = orderRepo.create({
      orderNumber,
      customerId: customer.id,
      driverId: driver?.id || null,
      origin: origins[i % origins.length],
      destination: destinations[i % destinations.length],
      merchandiseType: merchandise[i % merchandise.length],
      weight: Math.round((Math.random() * 5000 + 50) * 100) / 100,
      status,
      estimatedDate,
      deliveredAt,
      createdAt: createdDate,
      updatedAt: createdDate,
    });
    const saved = await orderRepo.save(order);
    orderRecords.push(saved);
    console.log(`  ✓ Pedido: ${orderNumber} (${status})`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. HISTORIAL DE PEDIDOS (uno por transición de estado)
  // ═══════════════════════════════════════════════════════════════════
  for (const order of orderRecords) {
    const existingHistory = await historyRepo.findOne({ where: { orderId: order.id } });
    if (existingHistory) continue;

    const transitions: { prev: string | null; next: string; changedBy: string; notes: string }[] = [];

    if (order.status === OrderStatus.PENDING) {
      transitions.push({ prev: null, next: OrderStatus.PENDING, changedBy: 'Sistema', notes: 'Pedido registrado' });
    } else if (order.status === OrderStatus.PREPARING) {
      transitions.push({ prev: null, next: OrderStatus.PENDING, changedBy: 'Sistema', notes: 'Pedido registrado' });
      transitions.push({ prev: OrderStatus.PENDING, next: OrderStatus.PREPARING, changedBy: 'Operador Logístico', notes: 'Preparando pedido para despacho' });
    } else if (order.status === OrderStatus.TRANSIT) {
      transitions.push({ prev: null, next: OrderStatus.PENDING, changedBy: 'Sistema', notes: 'Pedido registrado' });
      transitions.push({ prev: OrderStatus.PENDING, next: OrderStatus.PREPARING, changedBy: 'Operador Logístico', notes: 'Pedido preparado' });
      transitions.push({ prev: OrderStatus.PREPARING, next: OrderStatus.TRANSIT, changedBy: 'Conductor asignado', notes: 'En ruta de entrega' });
    } else if (order.status === OrderStatus.DELIVERED) {
      transitions.push({ prev: null, next: OrderStatus.PENDING, changedBy: 'Sistema', notes: 'Pedido registrado' });
      transitions.push({ prev: OrderStatus.PENDING, next: OrderStatus.PREPARING, changedBy: 'Operador Logístico', notes: 'Pedido preparado' });
      transitions.push({ prev: OrderStatus.PREPARING, next: OrderStatus.TRANSIT, changedBy: 'Conductor asignado', notes: 'En ruta de entrega' });
      transitions.push({ prev: OrderStatus.TRANSIT, next: OrderStatus.DELIVERED, changedBy: 'Conductor', notes: 'Entregado al cliente. Sin incidencias.' });
    } else if (order.status === OrderStatus.CANCELLED) {
      transitions.push({ prev: null, next: OrderStatus.PENDING, changedBy: 'Sistema', notes: 'Pedido registrado' });
      transitions.push({ prev: OrderStatus.PENDING, next: OrderStatus.CANCELLED, changedBy: 'Coordinador', notes: 'Cancelado por falta de inventario' });
    }

    for (let t = 0; t < transitions.length; t++) {
      const tr = transitions[t];
      const createdAt = new Date(order.createdAt.getTime() + t * 3600000); // 1h entre transiciones
      const history = historyRepo.create({
        orderId: order.id,
        previousStatus: tr.prev,
        newStatus: tr.next,
        changedBy: tr.changedBy,
        notes: tr.notes,
        createdAt,
      });
      await historyRepo.save(history);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6b. INCIDENCIAS — agregar incidentImage a algunos historiales
  // ═══════════════════════════════════════════════════════════════════
  const incidentDescriptions = [
    'Cliente no se encontraba en domicilio',
    'Mercadería dañada durante el traslado',
    'Dirección incorrecta proporcionada por el cliente',
    'Problemas con el pago contra entrega',
    'Producto faltante en el pedido',
    'Vehículo sufrió desperfecto mecánico en ruta',
    'Cliente solicitó reprogramación de entrega',
    'Documentación incompleta para la entrega',
    'Zona de entrega bloqueada por manifestación',
    'Inconvenientes con la descarga de mercadería',
  ];

  const historyWithIncident = await historyRepo.find({ take: 6, order: { createdAt: 'DESC' } });
  for (let i = 0; i < historyWithIncident.length; i++) {
    const h = historyWithIncident[i];
    if (h.incidentImage) continue;
    h.incidentImage = 'incident-seed-' + (i + 1) + '.jpg';
    h.notes = incidentDescriptions[i % incidentDescriptions.length];
    await historyRepo.save(h);
    console.log(`  ✓ Incidencia añadida al historial: ${h.notes}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6c. PEDIDOS ADICIONALES — datos de hoy para el dashboard
  // ═══════════════════════════════════════════════════════════════════
  const todayOrdersCount = await orderRepo.count({ where: { orderNumber: Like('ORD-' + now.toISOString().slice(0, 10).replace(/-/g, '') + '-%') } });
  if (todayOrdersCount === 0) {
    // 5 pedidos de hoy: 3 entregados, 1 en tránsito, 1 pendiente
    const todayStatuses: OrderStatus[] = [
      OrderStatus.DELIVERED, OrderStatus.DELIVERED, OrderStatus.DELIVERED,
      OrderStatus.TRANSIT, OrderStatus.PENDING,
    ];
    for (let i = 0; i < 5; i++) {
      const customer = customerRecords[i % customerRecords.length];
      const status = todayStatuses[i];
      const createdDate = new Date();
      createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 8) + 1); // hoy, en las últimas 8h

      const estimatedDate = new Date(createdDate);
      estimatedDate.setDate(estimatedDate.getDate() + 1);

      let deliveredAt: Date | null = null;
      if (status === OrderStatus.DELIVERED) {
        deliveredAt = new Date();
        deliveredAt.setHours(deliveredAt.getHours() - Math.floor(Math.random() * 3));
      }

      const driver = status === OrderStatus.DELIVERED || status === OrderStatus.TRANSIT
        ? allDriverRecords[(30 + i) % allDriverRecords.length] : null;

      const orderNumber = `ORD-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(100 + i).padStart(4, '0')}`;

      const order = orderRepo.create({
        orderNumber,
        customerId: customer.id,
        driverId: driver?.id || null,
        origin: origins[i % origins.length],
        destination: destinations[i % destinations.length],
        merchandiseType: merchandise[i % merchandise.length],
        weight: Math.round((Math.random() * 5000 + 50) * 100) / 100,
        status,
        estimatedDate,
        deliveredAt,
        createdAt: createdDate,
        updatedAt: createdDate,
      });
      const saved = await orderRepo.save(order);
      orderRecords.push(saved);
      console.log(`  ✓ Pedido hoy: ${orderNumber} (${status})`);

      // Crear historial
      const transitions: { prev: string | null; next: string; changedBy: string; notes: string }[] = [];
      transitions.push({ prev: null, next: OrderStatus.PENDING, changedBy: 'Sistema', notes: 'Pedido registrado' });
      if (status === OrderStatus.TRANSIT || status === OrderStatus.DELIVERED) {
        transitions.push({ prev: OrderStatus.PENDING, next: OrderStatus.PREPARING, changedBy: 'Operador', notes: 'Preparado' });
        transitions.push({ prev: OrderStatus.PREPARING, next: OrderStatus.TRANSIT, changedBy: 'Conductor', notes: 'En ruta' });
      }
      if (status === OrderStatus.DELIVERED) {
        transitions.push({ prev: OrderStatus.TRANSIT, next: OrderStatus.DELIVERED, changedBy: 'Conductor', notes: 'Entregado sin incidencias' });
      }

      for (let t = 0; t < transitions.length; t++) {
        const tr = transitions[t];
        const h = historyRepo.create({
          orderId: saved.id,
          previousStatus: tr.prev,
          newStatus: tr.next,
          changedBy: tr.changedBy,
          notes: tr.notes,
          createdAt: new Date(createdDate.getTime() + t * 600000),
        });
        await historyRepo.save(h);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. MANTENIMIENTOS (20)
  // ═══════════════════════════════════════════════════════════════════
  const maintenanceData = [
    { vehicleIdx: 0, type: MaintenanceType.ROUTINE, desc: 'Cambio de aceite y filtros', cost: 850.00, sched: '2026-02-15', comp: '2026-02-15', status: MaintenanceStatus.COMPLETED, notes: 'OK' },
    { vehicleIdx: 1, type: MaintenanceType.ROUTINE, desc: 'Revisión de frenos y suspensión', cost: 1200.50, sched: '2026-03-10', comp: '2026-03-10', status: MaintenanceStatus.COMPLETED, notes: 'Pastillas de freno reemplazadas' },
    { vehicleIdx: 2, type: MaintenanceType.ROUTINE, desc: 'Mantenimiento preventivo 10,000 km', cost: 650.00, sched: '2026-04-20', comp: '2026-04-20', status: MaintenanceStatus.COMPLETED, notes: 'Todo en orden' },
    { vehicleIdx: 3, type: MaintenanceType.REPAIR, desc: 'Reparación de motor (pérdida de potencia)', cost: 4500.00, sched: '2026-01-05', comp: '2026-01-12', status: MaintenanceStatus.COMPLETED, notes: 'Inyectores reemplazados' },
    { vehicleIdx: 6, type: MaintenanceType.INSPECTION, desc: 'Inspección técnica pre-venta', cost: 300.00, sched: '2026-05-01', comp: '2026-05-01', status: MaintenanceStatus.COMPLETED, notes: 'Se recomienda cambio de llantas' },
    { vehicleIdx: 0, type: MaintenanceType.ROUTINE, desc: 'Cambio de llantas delanteras', cost: 2100.00, sched: '2026-05-20', comp: '2026-05-21', status: MaintenanceStatus.COMPLETED, notes: 'Michelin 275/80R22.5' },
    { vehicleIdx: 4, type: MaintenanceType.ROUTINE, desc: 'Service 5,000 km', cost: 450.00, sched: '2026-06-01', comp: null, status: MaintenanceStatus.SCHEDULED, notes: '' },
    { vehicleIdx: 7, type: MaintenanceType.ROUTINE, desc: 'Alineación y balanceo', cost: 280.00, sched: '2026-06-10', comp: null, status: MaintenanceStatus.SCHEDULED, notes: '' },
    { vehicleIdx: 10, type: MaintenanceType.REPAIR, desc: 'Fallo en sistema de refrigeración', cost: 1800.00, sched: '2026-05-25', comp: '2026-05-28', status: MaintenanceStatus.COMPLETED, notes: 'Radiador reemplazado' },
    { vehicleIdx: 12, type: MaintenanceType.ROUTINE, desc: 'Cambio de aceite y filtro de aire', cost: 780.00, sched: '2026-05-30', comp: '2026-05-30', status: MaintenanceStatus.COMPLETED, notes: '' },
    { vehicleIdx: 14, type: MaintenanceType.REPAIR, desc: 'Reconstrucción de caja de cambios', cost: 6200.00, sched: '2026-04-15', comp: '2026-04-28', status: MaintenanceStatus.COMPLETED, notes: 'Sincronizadores reemplazados' },
    { vehicleIdx: 3, type: MaintenanceType.INSPECTION, desc: 'Inspección post-reparación', cost: 0, sched: '2026-01-13', comp: '2026-01-13', status: MaintenanceStatus.COMPLETED, notes: 'Motor funciona correctamente' },
    { vehicleIdx: 8, type: MaintenanceType.ROUTINE, desc: 'Mantenimiento preventivo 30,000 km', cost: 520.00, sched: '2026-06-05', comp: null, status: MaintenanceStatus.SCHEDULED, notes: 'Pendiente de taller' },
    { vehicleIdx: 17, type: MaintenanceType.ROUTINE, desc: 'Rotación de llantas', cost: 150.00, sched: '2026-06-15', comp: null, status: MaintenanceStatus.SCHEDULED, notes: '' },
    { vehicleIdx: 5, type: MaintenanceType.ROUTINE, desc: 'Cambio de bujías y aceite de motor', cost: 320.00, sched: '2026-05-10', comp: '2026-05-10', status: MaintenanceStatus.COMPLETED, notes: '' },
    { vehicleIdx: 19, type: MaintenanceType.ROUTINE, desc: 'Service inaugural 10,000 km', cost: 400.00, sched: '2026-06-20', comp: null, status: MaintenanceStatus.SCHEDULED, notes: 'Programado' },
    { vehicleIdx: 22, type: MaintenanceType.REPAIR, desc: 'Reemplazo de batería y alternador', cost: 950.00, sched: '2026-05-18', comp: '2026-05-18', status: MaintenanceStatus.COMPLETED, notes: 'Batería Bosch de 80Ah' },
    { vehicleIdx: 13, type: MaintenanceType.ROUTINE, desc: 'Mantenimiento preventivo 5,000 km', cost: 380.00, sched: '2026-06-25', comp: null, status: MaintenanceStatus.SCHEDULED, notes: '' },
    { vehicleIdx: 9, type: MaintenanceType.INSPECTION, desc: 'Inspección anual de flota', cost: 250.00, sched: '2026-07-01', comp: null, status: MaintenanceStatus.SCHEDULED, notes: 'Pendiente' },
    { vehicleIdx: 10, type: MaintenanceType.REPAIR, desc: 'Fuga de líquido hidráulico', cost: 1200.00, sched: '2026-06-08', comp: null, status: MaintenanceStatus.IN_PROGRESS, notes: 'En reparación' },
  ];

  for (const m of maintenanceData) {
    const veh = vehicleRecords[m.vehicleIdx];
    const existing = await maintenanceRepo.findOne({ where: { description: m.desc, vehicleId: veh.id } });
    if (existing) continue;
    const maintenance = maintenanceRepo.create({
      type: m.type, description: m.desc, cost: m.cost,
      scheduledDate: m.sched, completedDate: m.comp, status: m.status, notes: m.notes,
      vehicleId: veh.id,
    });
    await maintenanceRepo.save(maintenance);
    console.log(`  ✓ Mantenimiento: ${m.desc} (${veh.plate})`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 8. RUTAS (12) con paradas (3-5 c/u = ~48 paradas)
  // ═══════════════════════════════════════════════════════════════════
  const routeStatuses: RouteStatus[] = [
    RouteStatus.COMPLETED, RouteStatus.COMPLETED, RouteStatus.COMPLETED,
    RouteStatus.COMPLETED, RouteStatus.COMPLETED, RouteStatus.IN_PROGRESS,
    RouteStatus.IN_PROGRESS, RouteStatus.PLANNED, RouteStatus.PLANNED,
    RouteStatus.PLANNED, RouteStatus.PLANNED, RouteStatus.COMPLETED,
  ];

  const routeNames = [
    'Ruta Norte - Trujillo Centro', 'Ruta Sur - Moche', 'Ruta Este - Virú',
    'Ruta Oeste - Huanchaco', 'Ruta Centro - Lima Norte', 'Ruta Industrial - Callao',
    'Ruta Mañana - Trujillo', 'Ruta Tarde - La Esperanza', 'Ruta Express - Víctor Larco',
    'Ruta Delivery - Centro Trujillo', 'Ruta Semanal - Virú Valley', 'Ruta Mayorista - Mercado Mayorista',
  ];

  // Coordenadas de Trujillo y alrededores
  const stopLocations = [
    { addr: 'Av. España 780, Trujillo', lat: -8.1112, lng: -79.0288 },
    { addr: 'Jr. Junín 512, Trujillo', lat: -8.1089, lng: -79.0301 },
    { addr: 'Av. América Sur 1234, Trujillo', lat: -8.1212, lng: -79.0256 },
    { addr: 'Av. América Oeste 650, Trujillo', lat: -8.1150, lng: -79.0400 },
    { addr: 'Malecón Grau 180, Huanchaco', lat: -8.0792, lng: -79.1211 },
    { addr: 'Av. del Golf 120, Trujillo', lat: -8.1044, lng: -79.0456 },
    { addr: 'Av. Miraflores 230, Trujillo', lat: -8.1189, lng: -79.0350 },
    { addr: 'Fundo Los Valles s/n, Virú', lat: -8.4167, lng: -78.7500 },
    { addr: 'Carretera a Huanchaco Km 5', lat: -8.0900, lng: -79.0800 },
    { addr: 'Av. Juan Pablo II 880, Trujillo', lat: -8.1000, lng: -79.0333 },
    { addr: 'Mercado Central Puesto 45, Trujillo', lat: -8.1090, lng: -79.0310 },
    { addr: 'Jr. Gamarra 300, Trujillo', lat: -8.1075, lng: -79.0295 },
    { addr: 'Av. Larco 750, Trujillo', lat: -8.1120, lng: -79.0410 },
    { addr: 'Av. del Ejército 900, Trujillo', lat: -8.1200, lng: -79.0280 },
    { addr: 'Av. Industrial 1500, Trujillo', lat: -8.1350, lng: -79.0200 },
    { addr: 'Panamericana Norte Km 30, Puente Piedra', lat: -11.8550, lng: -77.0730 },
    { addr: 'Av. Industrial 500, Huancayo', lat: -12.0650, lng: -75.2100 },
    { addr: 'Av. Argentina 3200, Callao', lat: -12.0500, lng: -77.1400 },
  ];

  for (let ri = 0; ri < routeNames.length; ri++) {
    const routeStatus = routeStatuses[ri];
    const scheduledDate = daysAgo(Math.floor(Math.random() * 20) + 1);

    // 3-5 paradas por ruta
    const stopsCount = Math.floor(Math.random() * 3) + 3;
    const usedIdxs = new Set<number>();
    const rStops: typeof stopLocations = [];
    for (let s = 0; s < stopsCount; s++) {
      let idx: number;
      do { idx = Math.floor(Math.random() * stopLocations.length); } while (usedIdxs.has(idx));
      usedIdxs.add(idx);
      rStops.push(stopLocations[idx]);
    }

    const existingRoute = await routeRepo.findOne({ where: { name: routeNames[ri] } });
    if (existingRoute) continue;

    const totalDistance = stopsCount * (Math.random() * 15 + 5);
    const estimatedDuration = stopsCount * (Math.random() * 30 + 15);

    const route = routeRepo.create({
      name: routeNames[ri],
      description: `Planificación de entregas - ${routeNames[ri]}`,
      status: routeStatus,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedDuration: Math.round(estimatedDuration * 100) / 100,
      scheduledDate,
      ordersCount: rStops.length,
    });
    const savedRoute = await routeRepo.save(route);

    // Crear las paradas
    for (let si = 0; si < rStops.length; si++) {
      const loc = rStops[si];
      let stopStatus = StopStatus.PENDING;
      if (routeStatus === RouteStatus.COMPLETED) stopStatus = StopStatus.COMPLETED;
      else if (routeStatus === RouteStatus.IN_PROGRESS && si === 0) stopStatus = StopStatus.COMPLETED;
      else if (routeStatus === RouteStatus.IN_PROGRESS && si === 1) stopStatus = StopStatus.IN_PROGRESS;

      const stop = stopRepo.create({
        sequence: si + 1,
        address: loc.addr,
        latitude: loc.lat,
        longitude: loc.lng,
        status: stopStatus,
        estimatedArrival: Math.round((si + 1) * (estimatedDuration / rStops.length) * 100) / 100,
        distanceFromPrevious: si === 0 ? 0 : Math.round((Math.random() * 10 + 2) * 100) / 100,
        routeId: savedRoute.id,
      });
      await stopRepo.save(stop);
    }

    console.log(`  ✓ Ruta: ${routeNames[ri]} (${rStops.length} paradas, ${routeStatus})`);
  }

  console.log('\n✅ Seed completado exitosamente.');
  console.log(`   • ${usersData.length} usuarios`);
  console.log(`   • ${allDriverRecords.length} transportistas`);
  console.log(`   • ${customerRecords.length} clientes`);
  console.log(`   • ${vehicleRecords.length} vehículos`);
  console.log(`   • ${orderRecords.length} pedidos`);
  console.log(`   • ${maintenanceData.length} mantenimientos`);
  console.log(`   • ${routeNames.length} rutas`);
}

async function bootstrap() {
  console.log('\n🌱 Iniciando seed masivo...\n');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  await runSeed(dataSource);
  await app.close();
}

if (require.main === module || (process.argv[1] && process.argv[1].endsWith('seed.ts'))) {
  bootstrap().catch(err => { console.error('Error seeding database:', err); process.exit(1); });
}
