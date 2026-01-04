import { AbstractRepository } from '../../database/abstract.repository';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { User } from './user.schema';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  constructor(
    @Inject('FIREBASE_FIRESTORE') firestore: Firestore,
    logger: PinoLogger,
  ) {
    super(firestore, 'users', logger);
  }

  // Custom query methods specific to Users
  async findByEmail(email: string): Promise<User> {
    return this.findOneByQuery((col) =>
      col.where('email', '==', email).limit(1),
    );
  }

  async findByUsername(username: string): Promise<User> {
    return this.findOneByQuery((col) =>
      col.where('username', '==', username).limit(1),
    );
  }

  async findUsersCreatedAfter(date: Date): Promise<User[]> {
    return this.find((col) =>
      col.where('createdAt', '>', date).orderBy('createdAt', 'asc'),
    );
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    // Note: Firestore doesn't support full-text search natively
    // You might need to use a separate search service like Algolia
    // This is a basic implementation for exact matches
    return this.find((col) =>
      col.where('username', '==', searchTerm).limit(20),
    );
  }

  // Pagination with filters
  async findUsersPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      role?: string;
      isActive?: boolean;
      minCreatedAt?: Date;
    },
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = (col) => {
      let query: FirebaseFirestore.Query = col;

      if (filters?.minCreatedAt) {
        query = query.where('createdAt', '>=', filters.minCreatedAt);
      }

      return query.orderBy('createdAt', 'desc');
    };

    return this.paginate(queryBuilder, page, limit);
  }

  // Update with validation
  async updateUserProfile(
    userId: string,
    updates: Partial<User>,
  ): Promise<User> {
    // Add validation logic if needed
    const allowedFields = ['displayName', 'avatarUrl', 'bio', 'settings'];
    const sanitizedUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as Partial<User>);

    return this.findOneAndUpdate(userId, sanitizedUpdates);
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    try {
      await this.findByEmail(email);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }

  // Check if username exists
  async usernameExists(username: string): Promise<boolean> {
    try {
      await this.findByUsername(username);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }
}
