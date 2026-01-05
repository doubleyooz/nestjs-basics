import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, UserRecord } from 'firebase-admin/auth';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(@Inject('FIREBASE_AUTH') private readonly auth: Auth) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // 1. Create user in Firebase Authentication
      const userRecord = await this.auth.createUser({
        email: createUserDto.email,
        password: createUserDto.password,
        displayName: createUserDto.username,
        // other user properties
      });

      return userRecord;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll(
    maxResults: number = 1000,
    pageToken?: string,
  ): Promise<{
    users: UserRecord[];
    pageToken?: string;
  }> {
    try {
      const listUsersResult = await this.auth.listUsers(maxResults, pageToken);

      const users = listUsersResult.users.map((user) => user);

      return {
        users,
        pageToken: listUsersResult.pageToken,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async update(uid: string, updateUserDto: UpdateUserDto): Promise<UserRecord> {
    const updateRequest: UpdateUserDto = {};

    if (updateUserDto.email) {
      // Check if email is already taken by another user
      if (updateUserDto.email) {
        try {
          const existingUser = await this.auth.getUserByEmail(
            updateUserDto.email,
          );
          if (existingUser.uid !== uid) {
            throw new ConflictException('Email already exists');
          }
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            throw error;
          }
          // Email doesn't exist, which is good
        }
      }
      updateRequest.email = updateUserDto.email;
    }

    try {
      const updatedUser = await this.auth.updateUser(uid, updateRequest);

      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async findOneByEmail(email: string): Promise<UserRecord> {
    try {
      const userRecord = await this.auth.getUserByEmail(email);
      return userRecord;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('User not found');
    }
  }

  async findOneById(id: string): Promise<UserRecord> {
    try {
      const userRecord = await this.auth.getUser(id);
      return userRecord;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('User not found');
    }
  }

  async removeOneById(id: string) {
    try {
      await this.auth.deleteUser(id);
      return {
        message: 'User deleted successfully',
        id: id,
      };
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User with ID ${id} not found`);
        throw new UnauthorizedException();
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
