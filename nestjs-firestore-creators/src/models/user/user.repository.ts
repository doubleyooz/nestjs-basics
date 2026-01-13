// creator.repository.ts
import { AbstractRepository } from '../../database/abstract.repository';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { PinoLogger } from 'nestjs-pino';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { User, UserKeys } from './user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  constructor(
    @Inject('FIREBASE_FIRESTORE') firestore: Firestore,
    logger: PinoLogger,
  ) {
    super(firestore, 'users', logger);
  }

  // CREATE
  async createUser(createDto: CreateUserDto): Promise<User> {
    // Transform DTO to database input
    const newUser: User = {
      email: createDto.email,
      password: createDto.password,
      id: '',
      tokenVersion: 0,
    };

    return this.create(newUser);
  }

  async findUsers(
    findUserDto?: FindUserDto,
    selection?: UserKeys[],
  ): Promise<User[]> {
    if (!findUserDto) {
      return this.findAll({ selection });
    }

    // If ID is provided, return a single user
    if (findUserDto?.id) {
      const user = await this.findOneById(findUserDto.id, { selection });
      return user ? [user] : [];
    }

    if (findUserDto.email) {
      const user = await this.findOneByQuery(
        (collection) => collection.where('email', '==', findUserDto.email),
        { selection },
      );
      return user ? [user] : [];
    }
    return [];
  }

  // Keep findUserById as a convenience wrapper (returns Promise<User>)
  async findUserById(id: string): Promise<User | null> {
    return await this.findOneById(id);
  }

  // Keep findUserByEmail as a convenience wrapper (returns Promise<User>)
  async findUserByEmail(email: string): Promise<User> {
    const result = await this.findUsers({ email });
    return Array.isArray(result) ? result[0] : result;
  }

  // UPDATE
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return this.findOneByIdAndUpdate(id, updates);
  }

  // DELETE
  async deleteUserById(id: string): Promise<User> {
    return this.findOneByIdAndDelete(id);
  }

  // VALIDATION & HELPERS
  async userExists(id: string): Promise<boolean> {
    return this.exists(id);
  }

  // UPDATE Token Version with atomic increment
  async updateTokenVersion(
    id: string,
    throwNotFound = false,
  ): Promise<User | null> {
    try {
      const userRef = this.collection.doc(id);

      // Use Firestore's atomic increment operation
      await userRef.update({
        tokenVersion: FieldValue.increment(1),
      });

      // Fetch and return the updated document
      const updatedDoc = await userRef.get();

      if (!updatedDoc.exists) {
        if (throwNotFound)
          throw new NotFoundException(`User with ID ${id} not found`);
        return null;
      }

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as User;
    } catch (error) {
      this.logger.error(`Failed to update tokenVersion for user ${id}:`, error);

      // If the user doesn't exist, throw NotFoundException

      if (error instanceof Error) {
        // Check for NOT_FOUND error by message or name
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('not found') ||
          errorMessage.includes('no document to update') ||
          errorMessage.includes('document does not exist')
        ) {
          if (throwNotFound)
            throw new NotFoundException(`User with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
}
