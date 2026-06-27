import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface RoleConfig {
  name: string;
  label: string;
  description: string;
  permissions: string[];
}

@Injectable()
export class RolesService {
  private rolesConfig: RoleConfig[] = [];
  private originalRolesConfig: RoleConfig[] = [];
  private configPath: string;

  constructor(private configService: ConfigService) {
    this.configPath = path.join(process.cwd(), 'src', 'config', 'roles.config.json');
    this.loadRolesConfig();
  }

  private loadRolesConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      const config = JSON.parse(configContent);
      this.rolesConfig = config.roles || [];
      this.originalRolesConfig = JSON.parse(JSON.stringify(this.rolesConfig));
    } catch (error) {
      console.error('Error loading roles config:', error);
      this.rolesConfig = [];
      this.originalRolesConfig = [];
    }
  }

  getAllRoles(): RoleConfig[] {
    return this.rolesConfig;
  }

  getRoleByName(name: string): RoleConfig | undefined {
    return this.rolesConfig.find(role => role.name === name);
  }

  hasPermission(roleName: string, permission: string): boolean {
    const role = this.getRoleByName(roleName);
    return role ? role.permissions.includes(permission) : false;
  }

  getPermissionsByRole(roleName: string): string[] {
    const role = this.getRoleByName(roleName);
    return role ? role.permissions : [];
  }

  updateRolePermissions(name: string, permissions: string[]): RoleConfig | null {
    const roleIndex = this.rolesConfig.findIndex(role => role.name === name);
    if (roleIndex === -1) return null;

    this.rolesConfig[roleIndex].permissions = permissions;

    try {
      const config = { roles: this.rolesConfig };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving roles config:', error);
      return null;
    }

    return this.rolesConfig[roleIndex];
  }

  /** Restaura TODOS los roles a sus permisos originales de fábrica */
  resetRoles(): RoleConfig[] {
    this.rolesConfig = JSON.parse(JSON.stringify(this.originalRolesConfig));
    try {
      const config = { roles: this.rolesConfig };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error resetting roles config:', error);
    }
    return this.rolesConfig;
  }

  reloadConfig() {
    this.loadRolesConfig();
  }
}
