import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Driver, DriverStatus } from './drivers/entities/driver.entity';
import { Customer } from './customers/entities/customer.entity';
import { Role } from './common/enums/role.enum';

export async function runSeed(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const driverRepository = dataSource.getRepository(Driver);
  const customerRepository = dataSource.getRepository(Customer);

  // Ensure uuid-ossp extension
  await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // Insert Users (Passes: Admin123!, Coord123!, Driver123!, Customer123!)
  const usersData = [
    {
      email: 'admin@transporte.com',
      password: '$2a$10$3Btq514.GPI9Hl918AKhJOvMC3eKzryXUnkUTCi5hLXTZLLwruQxu', // Admin123!
      name: 'Administrador',
      role: Role.ADMIN,
      isActive: true,
    },
    {
      email: 'coord@transporte.com',
      password: '$2a$10$sCN8N4AByBlFDClJYk1VceZc37scOYDNGSFpIhCpTYgaQ/wZ7mIQW', // Coord123!
      name: 'Coordinador Principal',
      role: Role.COORDINATOR,
      isActive: true,
    },
    {
      email: 'operator@transporte.com',
      password: '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', // Operator123!
      name: 'Operador Logístico',
      role: Role.OPERATOR,
      isActive: true,
    },
    {
      email: 'manager@transporte.com',
      password: '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', // Manager123!
      name: 'Gerente de Operaciones',
      role: Role.MANAGER,
      isActive: true,
    },
    {
      email: 'driver1@transporte.com',
      password: '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', // Driver123!
      name: 'Carlos Rodríguez',
      role: Role.DRIVER,
      isActive: true,
    },
    {
      email: 'driver2@transporte.com',
      password: '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', // Driver123!
      name: 'María Torres',
      role: Role.DRIVER,
      isActive: true,
    },
    {
      email: 'driver3@transporte.com',
      password: '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', // Driver123!
      name: 'José Mendoza',
      role: Role.DRIVER,
      isActive: true,
    },
    {
      email: 'customer@transporte.com',
      password: '$2a$10$yByHyZUy7ll.bQv.gCWSc.Bn47GnLS9PsV/9fL0jISBse8Wdlzh2.', // Customer123!
      name: 'Cliente Demo',
      role: Role.CUSTOMER,
      isActive: true,
    },
  ];

  const emailToUserMap: Record<string, User> = {};

  for (const u of usersData) {
    let user = await userRepository.findOne({ where: { email: u.email } });
    if (!user) {
      user = userRepository.create(u);
      user = await userRepository.save(user);
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
    emailToUserMap[u.email] = user;
  }

  // Insert Drivers
  const driversData = [
    {
      name: 'Carlos Rodríguez',
      phone: '+51 987 654 321',
      licenseNumber: 'LIC-001-PE',
      vehicleType: 'Camión 5T',
      vehiclePlate: 'ABC-123',
      status: DriverStatus.AVAILABLE,
      userEmail: 'driver1@transporte.com',
    },
    {
      name: 'María Torres',
      phone: '+51 976 543 210',
      licenseNumber: 'LIC-002-PE',
      vehicleType: 'Furgón',
      vehiclePlate: 'XYZ-456',
      status: DriverStatus.AVAILABLE,
      userEmail: 'driver2@transporte.com',
    },
    {
      name: 'José Mendoza',
      phone: '+51 965 432 109',
      licenseNumber: 'LIC-003-PE',
      vehicleType: 'Camioneta',
      vehiclePlate: 'DEF-789',
      status: DriverStatus.AVAILABLE,
      userEmail: 'driver3@transporte.com',
    },
  ];

  for (const d of driversData) {
    let driver = await driverRepository.findOne({ where: { name: d.name } });
    if (!driver) {
      const associatedUser = emailToUserMap[d.userEmail];
      if (!associatedUser) {
        console.warn(`User for driver ${d.name} not found!`);
        continue;
      }
      driver = driverRepository.create({
        name: d.name,
        phone: d.phone,
        licenseNumber: d.licenseNumber,
        vehicleType: d.vehicleType,
        vehiclePlate: d.vehiclePlate,
        status: d.status,
        userId: associatedUser.id,
        user: associatedUser,
      });
      await driverRepository.save(driver);
      console.log(`Created driver: ${d.name}`);
    } else {
      console.log(`Driver already exists: ${d.name}`);
    }
  }

  // Insert Customers
  const customersData = [
    {
      name: 'Empresa ABC S.A.C.',
      email: 'empresa1@cliente.com',
      phone: '+51 044 123456',
      address: 'Av. Industrial 123, Trujillo',
    },
    {
      name: 'Distribuidora XYZ E.I.R.L.',
      email: 'empresa2@cliente.com',
      phone: '+51 044 654321',
      address: 'Jr. Comercio 456, Trujillo',
    },
  ];

  for (const c of customersData) {
    let customer = await customerRepository.findOne({ where: { email: c.email } });
    if (!customer) {
      customer = customerRepository.create(c);
      await customerRepository.save(customer);
      console.log(`Created customer: ${c.email}`);
    } else {
      console.log(`Customer already exists: ${c.email}`);
    }
  }
}

async function bootstrap() {
  console.log('Seeding database...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  await runSeed(dataSource);

  console.log('Seeding finished successfully.');
  await app.close();
}

// Check if run directly
if (require.main === module || (process.argv[1] && process.argv[1].endsWith('seed.ts'))) {
  bootstrap().catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
}
