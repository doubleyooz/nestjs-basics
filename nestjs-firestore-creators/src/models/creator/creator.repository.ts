// creator.repository.ts
import { AbstractRepository } from '../../database/abstract.repository';
import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { Creator, SocialMediaPlatform, Impact } from './creator.schema';
import { PinoLogger } from 'nestjs-pino';
import { CreateCreatorDto } from './dto/create-creator.dto';

export type FindCreatorsFilterOptions = {
  id?: string;
  name?: string;
  platform?: SocialMediaPlatform;
  impact?: Impact;
  searchTerm?: string;
  filters?: {
    impact?: Impact;
    platform?: SocialMediaPlatform;
    createdAtAfter?: Date;
    createdAtBefore?: Date;
  };
  limit?: number;
  orderBy?: {
    field: keyof Creator | 'createdAt' | 'name' | 'impact';
    direction?: 'asc' | 'desc';
  };
}

@Injectable()
export class CreatorRepository extends AbstractRepository<Creator> {
  constructor(
    @Inject('FIREBASE_FIRESTORE') firestore: Firestore,
    logger: PinoLogger,
  ) {
    super(firestore, 'creators', logger);
  }

  // CREATE
  async createCreator(
    createDto: CreateCreatorDto,
    options?: { impact?: Impact },
  ): Promise<Creator> {
    // Transform DTO to database input
    const dbInput: Creator = {
      name: createDto.name,
      description: createDto.description,
      profilePicture: createDto.profilePicture || '', // Default empty string
      socialMediaPlatforms: createDto.socialMediaPlatforms,
      impact: options?.impact || 'medium',
      id: '',
    };

    return this.create(dbInput);
  }

  async findCreators(options?: FindCreatorsFilterOptions): Promise<Creator[] | Creator> {
    // If ID is provided, return a single creator
    if (options?.id) {
      return this.findOneById(options.id);
    }

    // If name is provided, return a single creator by name
    if (options?.name) {
      return this.findOneByQuery((col) =>
        col.where('name', '==', options.name).limit(1),
      );
    }

    // If searchTerm is provided, perform search
    if (options?.searchTerm) {
      return this.find((col) =>
        col
          .where('name', '>=', options.searchTerm)
          .where('name', '<=', options.searchTerm + '\uf8ff')
          .limit(options?.limit || 20),
      );
    }

    // Build the query based on filters
    return this.find((col) => {
      let query: FirebaseFirestore.Query = col;

      // Handle platform filter (single platform)
      if (options?.platform) {
        query = query.where(
          'socialMediaPlatforms.platform',
          'array-contains',
          options.platform,
        );
      }

      // Handle impact filter (single impact)
      if (options?.impact) {
        query = query.where('impact', '==', options.impact);
      }

      // Handle complex filters
      if (options?.filters) {
        const { filters } = options;

        if (filters.impact) {
          query = query.where('impact', '==', filters.impact);
        }

        if (filters.platform) {
          query = query.where(
            'socialMediaPlatforms.platform',
            'array-contains',
            filters.platform,
          );
        }

        if (filters.createdAtAfter) {
          query = query.where('createdAt', '>=', filters.createdAtAfter);
        }

        if (filters.createdAtBefore) {
          query = query.where('createdAt', '<=', filters.createdAtBefore);
        }
      }

      // Apply ordering
      const orderByField = options?.orderBy?.field || 'createdAt';
      const orderByDirection = options?.orderBy?.direction || 'desc';

      query = query.orderBy(orderByField, orderByDirection);

      // Apply limit if specified
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      return query;
    });
  }

  // Keep the findAllCreators method as a convenience wrapper
  async findAllCreators(limit?: number): Promise<Creator[]> {
    const result = await this.findCreators({ limit });
    return Array.isArray(result) ? result : [result];
  }

  // Keep findCreatorById as a convenience wrapper (returns Promise<Creator>)
  async findCreatorById(id: string): Promise<Creator> {
    const result = await this.findCreators({ id });
    return Array.isArray(result) ? result[0] : result;
  }

  // Keep findCreatorByName as a convenience wrapper (returns Promise<Creator>)
  async findCreatorByName(name: string): Promise<Creator> {
    const result = await this.findCreators({ name });
    return Array.isArray(result) ? result[0] : result;
  }

  // UPDATE
  async updateCreator(id: string, updates: Partial<Creator>): Promise<Creator> {
    return this.findOneByIdAndUpdate(id, updates);
  }

  async updateCreatorName(id: string, newName: string): Promise<Creator> {
    return this.findOneByIdAndUpdate(id, { name: newName });
  }

  async updateCreatorDescription(
    id: string,
    newDescription: string,
  ): Promise<Creator> {
    return this.findOneByIdAndUpdate(id, { description: newDescription });
  }

  async updateCreatorImpact(id: string, impact: Impact): Promise<Creator> {
    return this.findOneByIdAndUpdate(id, { impact });
  }

  async addSocialMediaPlatform(
    id: string,
    platform: SocialMediaPlatform,
    url: string,
  ): Promise<Creator> {
    const creator = await this.findCreatorById(id);
    const existingPlatforms = creator.socialMediaPlatforms || [];

    // Check if platform already exists
    const platformExists = existingPlatforms.some(
      (p) => p.platform === platform,
    );

    if (platformExists) {
      throw new Error(`Platform ${platform} already exists for this creator`);
    }

    const updatedPlatforms = [...existingPlatforms, { platform, url }];
    return this.findOneByIdAndUpdate(id, {
      socialMediaPlatforms: updatedPlatforms,
    });
  }

  async updateSocialMediaPlatform(
    id: string,
    platform: SocialMediaPlatform,
    newUrl: string,
  ): Promise<Creator> {
    const creator = await this.findCreatorById(id);
    const existingPlatforms = creator.socialMediaPlatforms || [];

    const platformIndex = existingPlatforms.findIndex(
      (p) => p.platform === platform,
    );

    if (platformIndex === -1) {
      throw new Error(`Platform ${platform} not found for this creator`);
    }

    const updatedPlatforms = [...existingPlatforms];
    updatedPlatforms[platformIndex] = { platform, url: newUrl };

    return this.findOneByIdAndUpdate(id, {
      socialMediaPlatforms: updatedPlatforms,
    });
  }

  async removeSocialMediaPlatform(
    id: string,
    platform: SocialMediaPlatform,
  ): Promise<Creator> {
    const creator = await this.findCreatorById(id);
    const existingPlatforms = creator.socialMediaPlatforms || [];

    const filteredPlatforms = existingPlatforms.filter(
      (p) => p.platform !== platform,
    );

    return this.findOneByIdAndUpdate(id, {
      socialMediaPlatforms: filteredPlatforms,
    });
  }

  // DELETE
  async deleteCreatorById(id: string): Promise<Creator> {
    return this.findOneByIdAndDelete(id);
  }

  // VALIDATION & HELPERS
  async creatorExists(id: string): Promise<boolean> {
    return this.exists(id);
  }
}
