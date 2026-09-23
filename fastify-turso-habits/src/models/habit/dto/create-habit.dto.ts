import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateHabitDto {
  @ApiProperty({
    example: 'Go to the gym',
    description: 'The name of the habit',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: '🏋️',
    description: 'An optional emoji representing the habit',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @ApiProperty({
    example: '#166534',
    description: 'An optional color used to display the habit',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}