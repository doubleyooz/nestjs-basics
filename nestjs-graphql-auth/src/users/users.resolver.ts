import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FindOneUserArgs } from './dtos/args/find-one.args';
import { FindUsersArgs } from './dtos/args/find.args';
import { CreateUserInput } from './dtos/input/create.input';
import { RemoveUserInput } from './dtos/input/remove.input';
import { UpdateUserInput } from './dtos/input/update.input';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  findOne(@Args() payload: FindOneUserArgs): User {
    return this.usersService.findOne();
  }

  @Query(() => [User], { nullable: 'items' })
  find(@Args() payload: FindUsersArgs): User[] {
    return this.usersService.find();
  }

  @Mutation(() => User)
  create(@Args('createUserData') payload: CreateUserInput): User {
    return this.usersService.create();
  }

  @Mutation(() => User)
  update(@Args('updateUserData') payload: UpdateUserInput): User {
    return this.usersService.update();
  }

  @Mutation(() => User)
  remove(@Args('deleteUserData') payload: RemoveUserInput): User {
    return this.usersService.remove();
  }
}
