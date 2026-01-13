import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Impact, type SocialMediaPlatform } from '../creator.schema';

export class CreateCreatorDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The profile picture of the creator',
    example: 'https://example.com/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiProperty({
    description: 'The social media platforms of the creator',
    example: [{ platform: 'instagram', url: 'https://example.com/instagram' }],
  })
  @IsArray()
  @IsNotEmpty()
  socialMediaPlatforms: {
    platform: SocialMediaPlatform;
    url: string;
  }[];

  @ApiProperty({
    description: 'Filter by impact level',
    enum: Impact,
    example: 'high',
  })
  @IsEnum(Impact)
  @IsOptional()
  impact?: Impact;
}
