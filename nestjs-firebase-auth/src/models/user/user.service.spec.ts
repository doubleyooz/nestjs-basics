import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UsersRepository } from './user.repository';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneByIdAndUpdate: jest.fn(),
      findOneByIdAndDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
