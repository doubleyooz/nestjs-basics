import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsInt
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example:"Christ is King",
    description: "a review's title",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title: string;

  @ApiProperty({
    example:"this is a lengthly description",
    description: "a review's description",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  @MinLength(20)
  description: string;

  @ApiProperty({
    example: 3.7,
    description: "a review's grade",
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 3,
    description: "the relation to an item",
  })
  @IsNumber()
  @IsInt({ message: 'itemId must be an integer' })
  @Min(1)
  itemId: number;
}
