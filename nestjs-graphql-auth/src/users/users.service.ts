import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FindOneUserByIdArgs } from './dtos/args/find-one-by-id.args';
import { FindOneUserByEmailArgs } from './dtos/args/find-one-by-email.args';
import { FindUsersArgs } from './dtos/args/find.args';
import { CreateUserInput } from './dtos/input/create.input';
import { RemoveUserInput } from './dtos/input/remove.input';
import { UpdateUserInput } from './dtos/input/update.input';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      _id: randomUUID(),
      age: 25,
      email: 'i231hsada4@email.com',
      password: 'sdasdasda@sSa21',
    },
  ];

  public create(createUserData: CreateUserInput): User {
    const user: User = {
      _id: randomUUID(),
      ...createUserData,
    };

    this.users.push(user);

    return user;
  }
  public update(updateUserData: UpdateUserInput): User {
    const user = this.users.find((user) => user._id === updateUserData._id);

    Object.assign(user, updateUserData);

    return user;
  }

  public findOneById(payload: FindOneUserByIdArgs): User {
    return this.users.find((user) => user._id === payload._id);
  }

  public findOneByEmail(payload: FindOneUserByEmailArgs): User {
    return this.users.find((user) => user.email === payload.email);
  }

  public find(payload: FindUsersArgs): User[] {
    if (payload.age)
      return this.users.filter((user) => user.age === payload.age);
    return this.users;
  }
  public remove(payload: RemoveUserInput): User {
    const userIndex = this.users.findIndex((user) => user._id === payload._id);
    const user = this.users[userIndex];

    this.users.splice(userIndex);

    return user;
  }
}
