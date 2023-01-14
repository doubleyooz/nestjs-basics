import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users: User[] = [];

  public create(): User {}
  public update(): User {}
  public findOne(): User {}
  public find(): User {}
  public remove(): User {}
}
