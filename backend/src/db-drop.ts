import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('Dropping database schema...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  await dataSource.dropDatabase();
  console.log('Database schema dropped successfully.');
  
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error dropping database:', err);
  process.exit(1);
});
