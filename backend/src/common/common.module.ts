import { Module, Global } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';

@Global()
@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class CommonModule {}
