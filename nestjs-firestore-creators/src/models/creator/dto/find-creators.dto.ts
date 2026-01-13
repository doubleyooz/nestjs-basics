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

export class FindCreatorsDto {
  @ApiPropertyOptional({
    description: 'Filter by creator ID',
    example: 'creator123',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filter by creator name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

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

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 50,
    minimum: 1,
    maximum: 1000,
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
