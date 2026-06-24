import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runSeed } from './seed';

async function bootstrap() {
  console.log('Resetting database (drop schema, initialize, synchronize, seed)...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  console.log('Dropping database schema...');
  await dataSource.dropDatabase();
  
  console.log('Initializing database (enabling uuid-ossp)...');
  await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  
  console.log('Synchronizing database schema...');
  await dataSource.synchronize();
  
  console.log('Seeding database...');
  await runSeed(dataSource);
  
  console.log('Database reset finished successfully.');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error resetting database:', err);
  process.exit(1);
});
