import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: "The User's email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Eight$CharLong2',
    description: "The user's new password",
  })
  @IsStrongPassword()
  password: string;

  
  @ApiProperty({
    example: 'Matt',
    description: "The User's name",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
