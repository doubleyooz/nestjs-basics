import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { FindOneUserByEmailArgs } from './dto/args/find-one-by-email.args';
import { FindOneUserByIdArgs } from './dto/args/find-one-by-id.args';
import { FindUsersArgs } from './dto/args/find.args';
import { CreateUserInput } from './dto/input/create-user.request';
import { RemoveUserInput } from './dto/input/remove-user.request';
import { UpdateUserInput } from './dto/input/update-user.request';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  findOneById(@CurrentUser() user: User, @Args() payload: FindOneUserByIdArgs): User {
    console.log(user);
    return this.usersService.findOneById(payload);
  }
  @Query(() => User, { nullable: true })
  findOneByEmail(@Args() payload: FindOneUserByEmailArgs): User {
    return this.usersService.findOneByEmail(payload);
  }

  @Query(() => [User], { nullable: 'items' })
  find(@Args() payload: FindUsersArgs): User[] {
    return this.usersService.findAll(payload);
  }

  @Mutation(() => User)
  create(@Args('createUserData') payload: CreateUserInput): User {
    return this.usersService.create(payload);
  }

  @Mutation(() => User)
  update(@Args('updateUserData') payload: UpdateUserInput): User {
    return this.usersService.update(payload._id, payload);
  }

  @Mutation(() => User)
  remove(@Args('deleteUserData') payload: RemoveUserInput): User {
    return this.usersService.remove(payload);
  }
}
