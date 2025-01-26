import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    example: "Name",
    description: "a item's name",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "this is short",
    description: "a item's description",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: false,
    description: "by the default all items are public",
  })
  @IsBoolean()
  @IsOptional()
  public: boolean = true;
}
