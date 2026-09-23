import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsString,
  Matches,
} from 'class-validator';

export class ChangePasswordRequest {
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
    example: 'Eight$CharLong2',
    description: "The user's new password",
  })
  @IsString()
  @IsDefined()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
  @IsNotEmpty()
  password: string;
}
