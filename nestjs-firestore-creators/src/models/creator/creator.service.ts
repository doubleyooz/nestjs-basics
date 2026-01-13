import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import type { Creator, Impact, SocialMediaPlatform } from './creator.schema';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { CreatorRepository } from './creator.repository';
import { FindCreatorsDto } from './dto/find-creators.dto';

@Injectable()
export class CreatorService {
  constructor(private readonly creatorRepository: CreatorRepository) {}

  async createCreator(
    createDto: CreateCreatorDto,
    options?: { impact?: Impact },
  ): Promise<Creator> {
    try {
      return await this.creatorRepository.createCreator(createDto, options);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create creator');
    }
  }

  async findAll(filters: FindCreatorsDto): Promise<{
    creators: Creator[];
  }> {
    try {
      const creators = await this.creatorRepository.findCreators(filters);

      return {
        creators,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve creators');
    }
  }

  async updateCreator(
    id: string,
    updateCreatorDto: UpdateCreatorDto,
  ): Promise<Creator> {
    try {
      // Check if creator exists
      const exists = await this.creatorRepository.creatorExists(id);
      if (!exists) {
        throw new NotFoundException(`Creator with ID ${id} not found`);
      }

      // If updating name, check uniqueness
      if (updateCreatorDto.name) {
        const existingCreator = await this.creatorRepository.findCreatorByName(
          updateCreatorDto.name,
        );
        if (existingCreator && existingCreator.id !== id) {
          throw new ConflictException(
            `Creator with name "${updateCreatorDto.name}" already exists`,
          );
        }
      }

      // Prepare update data
      const updateData: Partial<Creator> = {};

      if (updateCreatorDto.name) {
        updateData.name = updateCreatorDto.name;
      }

      if (updateCreatorDto.description) {
        updateData.description = updateCreatorDto.description;
      }

      if (updateCreatorDto.profilePicture) {
        updateData.profilePicture = updateCreatorDto.profilePicture;
      }

      if (updateCreatorDto.socialMediaPlatforms) {
        updateData.socialMediaPlatforms = updateCreatorDto.socialMediaPlatforms;
      }

      if (updateCreatorDto.impact) {
        updateData.impact = updateCreatorDto.impact;
      }

      return await this.creatorRepository.updateCreator(id, updateData);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update creator');
    }
  }

  async findOneById(id: string): Promise<Creator> {
    try {
      const creator = await this.creatorRepository.findCreatorById(id);
      return creator;
    } catch (error) {
      if (error.message?.includes('Document not found')) {
        throw new NotFoundException(`Creator with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to retrieve creator');
    }
  }

  async findByPlatform(
    platform: SocialMediaPlatform,
  ): Promise<Creator | Creator[]> {
    try {
      return await this.creatorRepository.findCreators({ platform });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve creators by platform',
      );
    }
  }

  async findByImpact(impact: Impact): Promise<Creator | Creator[]> {
    try {
      return await this.creatorRepository.findCreators({ impact });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve creators by impact',
      );
    }
  }

  async deleteOneById(id: string): Promise<{ message: string; id: string }> {
    try {
      // Check if creator exists
      const exists = await this.creatorRepository.creatorExists(id);
      if (!exists) {
        throw new NotFoundException(`Creator with ID ${id} not found`);
      }

      const deletedCreator = await this.creatorRepository.deleteCreatorById(id);

      return {
        message: 'Creator deleted successfully',
        id: id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete creator');
    }
  }

  async addSocialMediaPlatform(
    id: string,
    platform: SocialMediaPlatform,
    url: string,
  ): Promise<Creator> {
    try {
      // Check if creator exists
      const exists = await this.creatorRepository.creatorExists(id);
      if (!exists) {
        throw new NotFoundException(`Creator with ID ${id} not found`);
      }

      return await this.creatorRepository.addSocialMediaPlatform(
        id,
        platform,
        url,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message?.includes('already exists')) {
        throw new ConflictException(error.message);
      }
      if (error.message?.includes('not found')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to add social media platform',
      );
    }
  }

  async updateSocialMediaPlatform(
    id: string,
    platform: SocialMediaPlatform,
    newUrl: string,
  ): Promise<Creator> {
    try {
      // Check if creator exists
      const exists = await this.creatorRepository.creatorExists(id);
      if (!exists) {
        throw new NotFoundException(`Creator with ID ${id} not found`);
      }

      return await this.creatorRepository.updateSocialMediaPlatform(
        id,
        platform,
        newUrl,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message?.includes('not found')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Failed to update social media platform',
      );
    }
  }

  async removeSocialMediaPlatform(
    id: string,
    platform: SocialMediaPlatform,
  ): Promise<Creator> {
    try {
      // Check if creator exists
      const exists = await this.creatorRepository.creatorExists(id);
      if (!exists) {
        throw new NotFoundException(`Creator with ID ${id} not found`);
      }

      return await this.creatorRepository.removeSocialMediaPlatform(
        id,
        platform,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove social media platform',
      );
    }
  }

  async nameExists(name: string): Promise<boolean> {
    try {
      await this.creatorRepository.findCreatorByName(name);
      return true;
    } catch (error) {
      if (error.message?.includes('Document not found')) {
        return false;
      }
      throw error;
    }
  }

  async creatorExists(id: string): Promise<boolean> {
    return this.creatorRepository.creatorExists(id);
  }

  async countCreators(): Promise<number> {
    try {
      return await this.creatorRepository.count();
    } catch (error) {
      throw new InternalServerErrorException('Failed to count creators');
    }
  }
}
