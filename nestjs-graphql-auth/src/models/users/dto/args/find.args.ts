import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class FindUsersArgs {
  @Field()
  @IsOptional()
  @IsInt()
  age?: number;

  @Field()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  
  @Field()
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

}
