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
    } catch (error) {
      console.error('Error loading roles config:', error);
      this.rolesConfig = [];
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

  reloadConfig() {
    this.loadRolesConfig();
  }
}
