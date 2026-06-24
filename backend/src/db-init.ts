import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('Initializing database (enabling uuid-ossp)...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  console.log('Database initialized successfully.');
  
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
