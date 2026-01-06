// find-creators.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsInt,
  Min,
  Max,
  IsObject,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { SocialMediaPlatform, Impact } from '../creator.schema';

export class FindCreatorsFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by impact level',
    enum: Impact,
    example: 'high',
  })
  @IsEnum(Impact)
  @IsOptional()
  impact?: Impact;

  @ApiPropertyOptional({
    description: 'Filter by social media platform',
    enum: SocialMediaPlatform,
    example: 'instagram',
  })
  @IsEnum([
    'instagram',
    'tiktok',
    'youtube',
    'twitter',
    'facebook',
    'linkedin',
    'github',
    'website',
  ])
  @IsOptional()
  platform?: SocialMediaPlatform;

  @ApiPropertyOptional({
    description: 'Filter creators created after this date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAtAfter?: Date;

  @ApiPropertyOptional({
    description: 'Filter creators created before this date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAtBefore?: Date;
}

export class FindCreatorsOrderByDto {
  @ApiPropertyOptional({
    description: 'Field to order by',
    enum: ['createdAt', 'name', 'impact'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsEnum(['createdAt', 'name', 'impact'])
  @IsOptional()
  field?: 'createdAt' | 'name' | 'impact' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  direction?: 'asc' | 'desc' = 'desc';
}

export class FindCreatorsDto {
  @ApiPropertyOptional({
    description: 'Find creator by ID (returns single creator)',
    example: 'abc123-def456-ghi789',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Find creator by exact name match (returns single creator)',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by a single platform',
    enum: SocialMediaPlatform,
    example: 'youtube',
  })
  @IsEnum([
    'instagram',
    'tiktok',
    'youtube',
    'twitter',
    'facebook',
    'linkedin',
    'github',
    'website',
  ])
  @IsOptional()
  platform?: SocialMediaPlatform;

  @ApiPropertyOptional({
    description: 'Filter by a single impact level',
    enum: ['low', 'medium', 'high', 'very high'],
    example: 'medium',
  })
  @IsEnum(['low', 'medium', 'high', 'very high'])
  @IsOptional()
  impact?: Impact;

  @ApiPropertyOptional({
    description: 'Search term for partial name matching',
    example: 'tech',
  })
  @IsString()
  @IsOptional()
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Complex filter options',
    type: FindCreatorsFiltersDto,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => FindCreatorsFiltersDto)
  filters?: FindCreatorsFiltersDto;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    minimum: 1,
    maximum: 1000,
    default: 20,
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sorting options',
    type: FindCreatorsOrderByDto,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => FindCreatorsOrderByDto)
  orderBy?: FindCreatorsOrderByDto;

  @ApiPropertyOptional({
    description: 'Include soft-deleted creators',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;

  // Helper methods
  getQueryType(): 'single' | 'multiple' {
    if (this.id || this.name) {
      return 'single';
    }
    return 'multiple';
  }

  getIsSingleQuery(): boolean {
    return this.getQueryType() === 'single';
  }

  getIsMultipleQuery(): boolean {
    return this.getQueryType() === 'multiple';
  }

  // Build Firestore query options
  toQueryOptions(): {
    id?: string;
    name?: string;
    platform?: SocialMediaPlatform;
    impact?: Impact;
    searchTerm?: string;
    filters?: FindCreatorsFiltersDto;
    limit?: number;
    orderBy?: {
      field: 'createdAt' | 'name' | 'impact';
      direction: 'asc' | 'desc';
    };
  } {
    return {
      id: this.id,
      name: this.name,
      platform: this.platform,
      impact: this.impact,
      searchTerm: this.searchTerm,
      filters: this.filters,
      limit: this.limit,
      orderBy: this.orderBy
        ? {
            field: this.orderBy.field,
            direction: this.orderBy.direction,
          }
        : undefined,
    };
  }
}

// Simplified version for common use cases
export class FindCreatorsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term (partial name match)',
    example: 'tech',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by impact',
    enum: Impact,
    example: 'high',
  })
  @IsEnum(Impact)
  @IsOptional()
  impact?: Impact;

  @ApiPropertyOptional({
    description: 'Filter by platform',
    enum: SocialMediaPlatform,
    example: 'youtube',
  })
  @IsEnum(SocialMediaPlatform)
  @IsOptional()
  platform?: SocialMediaPlatform;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'name', 'impact'],
    default: 'createdAt',
  })
  @IsEnum(['createdAt', 'name', 'impact'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'impact' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Created after date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAfter?: Date;

  @ApiPropertyOptional({
    description: 'Created before date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdBefore?: Date;
}