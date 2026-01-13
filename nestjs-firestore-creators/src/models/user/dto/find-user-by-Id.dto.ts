import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindUserByIdDto {
  @ApiProperty({
    description: 'The id of the user',
    example: 'abc123',
    required: true,
  })
  @IsString()
  id: string;
}
