import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example:"tag's title",
    description: "A tag needed to sort things out",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title: string;
}
