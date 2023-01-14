import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
    Repository,
    getConnection,
    DeleteResult,
    DeepPartial,
    InsertResult,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly _repository: Repository<UserEntity>,
    ) {}

    async createUser(attributes: User): Promise<User> {
        const entity = Object.assign(new UserEntity(), attributes);
        const result: User = await this._repository.save(entity);

        return { email: result.email };
    }

    async findAllUsers(): Promise<User[]> {
        return this._repository.find();
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const result: User = await this._repository.findOne({ email });
        if (!result) {
            throw new NotFoundException('Not found');
        }

        return result;
    }

    async findById(id: string): Promise<User | undefined> {
        const result: User = await this._repository.findOne({ id });
        if (!result) {
            throw new NotFoundException('Not found');
        }

        return result;
    }

    async deleteById(id: string): Promise<DeleteResult> {
        return this._repository.delete({ id: id });
    }
}
