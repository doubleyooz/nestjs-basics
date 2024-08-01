import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}
  async create(createUserDto: CreateUserDto) {
    // Start a transaction
    return this.entityManager.transaction(async (manager) => {
      try {
        const user = new User(createUserDto);
        // Save the user using the transaction manager
        const savedUser = await manager.save(user);

        delete savedUser.password;

        return savedUser;
      } catch (err) {
        if (err.code === '23505') {
          throw new UnprocessableEntityException('Email already exists');
        }
        throw err; // Rethrow the error to let the transaction fail and rollback
      }
    });
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const tag = await this.findOne(id);

    tag.name = updateUserDto.name ?? tag.name;

    return await this.entityManager.save(tag);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
  }
}
