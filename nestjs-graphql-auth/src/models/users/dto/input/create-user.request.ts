import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail() 
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString() 
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  age: number;
}
