import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class RemoveUserInput {
  @Field()
  @IsNotEmpty()
  _id: string;
}
