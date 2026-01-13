import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserKeys } from './user.schema';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { FindUserByIdDto } from './dto/find-user-by-Id.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly _repository: UserRepository,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(UserService.name);

  async create(data: CreateUserDto) {
    console.log(data);
    try {
      const saltRounds = this.configService.get<number>('HASH_SALT') ?? 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const newDocument = await this._repository.create({
        ...data,
        tokenVersion: 0,
        password: hashedPassword,
      });
      console.log(newDocument);
      return newDocument;
    } catch (error) {
      console.log(error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async getUser(
    filter: FindUserDto,
    selection?: UserKeys[],
    throwError = false,
  ): Promise<User | null> {
    const [user] = await this._repository.findUsers(filter, selection);
    if (!user && throwError) {
      throw new NotFoundException('User not found');
    }

    return user || null;
  }

  async findAllUsers(
    filter: FindUserDto,
    selection?: UserKeys[],
    throwError = false,
  ): Promise<User | undefined> {
    const [user] = await this._repository.findUsers(filter, selection);
    if (!user && throwError) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findById(findById: FindUserByIdDto): Promise<User> {
    const document = await this._repository.findOneById(findById.id);
    if (!document) {
      this.logger.error(`No user with user id ${findById.id} was found.`, null);
      throw new NotFoundException('User not found.');
    }
    return document;
  }

  async updateTokenVersion(findById: FindUserByIdDto): Promise<User> {
    const document = await this._repository.updateTokenVersion(findById.id);
    if (!document) {
      this.logger.error(`No user with user id ${findById.id} was found.`, null);
      throw new NotFoundException('User not found.');
    }
    return document;
  }

  async deleteOneById(findById: FindUserByIdDto, throwNotFound = true) {
    // Find the user by ID
    const user = await this._repository.findUserById(findById.id);
    if (!user) {
      this.logger.error(`No user with user id ${findById.id} was found.`, null);
      if (throwNotFound) throw new NotFoundException('User not found.');
      return { deleted: null };
    }

    // Delete the user
    const deleted = await this._repository.deleteUserById(findById.id);

    // Optionally: If you want to cascade delete related reviews or other resources, you may do it here.
    // Example (only if you want to keep cleaning up user-related data):
    // if (this._reviewsRepository && user.id) {
    //   await this._reviewsRepository.deleteMany({ userId: user.id });
    // }

    return { deleted };
  }
}
