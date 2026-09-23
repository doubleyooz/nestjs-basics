import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RecoveryCodeRequest {
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
    example: false,
    description: 'If true, will not send an email',
  })
  @IsOptional()
  @IsBoolean()
  skipEmail: boolean = false;
}
