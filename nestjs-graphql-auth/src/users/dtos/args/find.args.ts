import { ArgsType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';
import { User } from 'src/users/models/user.model';

@ArgsType()
export class FindUsersArgs {
  @Field(() => [User])
  @IsArray()
  _id: string[];
}
