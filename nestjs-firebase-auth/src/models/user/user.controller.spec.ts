import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByQuery: jest.fn(),
      findOneByIdAndUpdate: jest.fn(),
      findOneByIdAndDelete: jest.fn(),
      findOneByQueryAndUpdate: jest.fn(),
      findOneByQueryAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
