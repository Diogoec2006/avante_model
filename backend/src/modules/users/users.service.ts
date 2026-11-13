import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con este correo electrónico');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password_hash,
      full_name: createUserDto.full_name,
      role: createUserDto.role,
    });

    const saved = await this.userRepository.save(user);
    delete saved.password_hash;
    return saved;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    user.is_active = !user.is_active;
    return this.userRepository.save(user);
  }
}

