import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

@ArgsType()
export class ValidateLoginArgs {
  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
  @IsNotEmpty()
  password: string;
}
