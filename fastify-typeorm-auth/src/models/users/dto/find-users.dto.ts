import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class FindUsersDto extends PartialType(CreateUserDto) {
  @IsNumber()
  @IsOptional()
  tokenVersion?: number;

  @IsNumber()
  @IsOptional()
  id?: number;
}
