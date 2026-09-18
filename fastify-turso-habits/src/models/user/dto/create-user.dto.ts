import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class CreateUserDto {
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
    example: 'Eight$CharLong2',
    description: "The user's new password",
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'Matt',
    description: "The User's name",
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  username: string;

  @Exclude()
  tokenVersion: number;

}