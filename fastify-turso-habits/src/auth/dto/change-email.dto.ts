import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsString,
} from 'class-validator';

export class ChangeEmailRequest {
  @ApiProperty({
    example: 'test@gmail.com',
    description: "The User's email address",
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '412341',
    description: 'Six digit code you received via email',
  })
  @IsDefined()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({
    example: 'newtest@gmail.com',
    description: "The new User's email address",
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}
