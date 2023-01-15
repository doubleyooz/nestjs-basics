import { ArgsType, Field } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'src/users/models/user.model';

@ArgsType()
export class FindUsersArgs {
  @Field()
  @IsOptional()
  @IsInt()
  age?: number;
}
