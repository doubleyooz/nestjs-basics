// creator.repository.ts
import { AbstractRepository } from '../../database/abstract.repository';
import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { Creator, SocialMediaPlatform, Impact } from './creator.schema';
import { PinoLogger } from 'nestjs-pino';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { FindCreatorsDto } from './dto/find-creators.dto';

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
      impact: options?.impact || Impact.medium,
      id: '',
    };

    return this.create(dbInput);
  }

  async findCreators(options?: FindCreatorsDto): Promise<Creator[]> {
    // If ID is provided, return a single creator
    if (options?.id) {
      const creator = await this.findOneById(options.id);
      return creator ? [creator] : [];
    }

    if (!options) {
      return this.findAll();
    }

    // Build the query based on filters
    return this.find((col) => {
      let query: FirebaseFirestore.Query = col;

      if (options?.platform) {
        query = query.where('platforms', 'array-contains', options.platform);
      }

      if (options?.name) {
        query = query
          .where('name', '>=', options.name)
          .where('name', '<=', options.name + '\uf8ff');
      }

      // Handle impact filter (single impact)
      if (options?.impact) {
        query = query.where('impact', '==', options.impact);
      }

      if (options?.createdAtAfter) {
        query = query.where('createdAt', '>=', options.createdAtAfter);
      }

      if (options?.createdAtBefore) {
        query = query.where('createdAt', '<=', options.createdAtBefore);
      }

      query = query.orderBy('createdAt', 'desc');

      // Apply limit if specified
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      return query;
    });
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
