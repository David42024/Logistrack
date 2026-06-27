import { Controller, Get, Param, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

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

  @Post('reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restaurar todos los roles a sus permisos originales' })
  resetRoles() {
    return this.rolesService.resetRoles();
  }

  @Patch(':name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar permisos de un rol' })
  updateRolePermissions(
    @Param('name') name: string,
    @Body() body: { permissions: string[] },
  ) {
    const updated = this.rolesService.updateRolePermissions(name, body.permissions);
    if (!updated) {
      return { error: 'Rol no encontrado' };
    }
    return updated;
  }
}
