import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles y permisos' })
  getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Obtener un rol específico por nombre' })
  getRoleByName(@Param('name') name: string) {
    return this.rolesService.getRoleByName(name);
  }
}
