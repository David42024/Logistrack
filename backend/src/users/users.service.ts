import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: Partial<User>) {
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStatus(id: string, isActive: boolean) {
    await this.usersRepository.update(id, { isActive });
    return this.findOne(id);
  }

  async getActivity(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      activity: [
        {
          action: 'Cuenta creada',
          timestamp: user.createdAt,
        },
        {
          action: 'Última actualización',
          timestamp: user.updatedAt,
        },
      ],
    };
  }

  async remove(id: string) {
    await this.usersRepository.update(id, { isActive: false });
    return { message: 'User deactivated' };
  }
}
