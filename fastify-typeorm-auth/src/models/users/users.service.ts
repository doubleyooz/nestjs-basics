import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FindUsersDto } from './dto/find-users.dto';

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

  async findAll(filters?: FindUsersDto) {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filters?.name) {
      queryBuilder.andWhere('user.name LIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters?.email) {
      queryBuilder.andWhere('user.email = :email', { email: filters.email });
    }

    if (filters?.id) {
      queryBuilder.andWhere('user.id = :id', { id: filters.id });
    }

    if (filters?.tokenVersion !== undefined) {
      queryBuilder.andWhere('user.tokenVersion = :tokenVersion', {
        tokenVersion: filters.tokenVersion,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOneById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const tag = await this.findOneById(id);

    tag.name = updateUserDto.name ?? tag.name;

    return await this.entityManager.save(tag);
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
  }

  async validateUser(_email: string, _password: string) {
    const user = await this.usersRepository.findOne({
      where: { email: _email },
      select: { password: true },
    });
    if (!user) throw new UnauthorizedException('Credentials are not valid');
    const isValidPassword = await bcrypt.compare(_password, user.password);
    if (!isValidPassword)
      throw new UnauthorizedException('Credentials are not valid');
    delete user.password;

    return user;
  }
}
