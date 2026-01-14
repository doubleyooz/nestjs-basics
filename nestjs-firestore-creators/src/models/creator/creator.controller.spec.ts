import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { FindCreatorsDto } from './dto/find-creators.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../user/user.schema';

describe('CreatorController', () => {
  let controller: CreatorController;
  let creatorService: CreatorService;

  const mockUser: Partial<User> = {
    id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockCreator = {
    id: 'creator-id-123',
    name: 'Test Creator',
    email: 'creator@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatorService = {
    createCreator: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    updateCreator: jest.fn(),
    deleteOneById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatorController],
      providers: [
        {
          provide: CreatorService,
          useValue: mockCreatorService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CreatorController>(CreatorController);
    creatorService = module.get<CreatorService>(CreatorService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new creator', async () => {
      const createCreatorDto: CreateCreatorDto = {
        name: 'New Creator',
        email: 'new@example.com',
      };

      mockCreatorService.createCreator.mockResolvedValue(mockCreator);

      const result = await controller.create(createCreatorDto);

      expect(creatorService.createCreator).toHaveBeenCalledWith(
        createCreatorDto,
      );
      expect(result).toEqual(mockCreator);
    });

    it('should apply JwtAuthGuard', () => {
      const metadata = Reflect.getMetadata('__guards__', controller.create);
      expect(metadata).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all creators with filters', async () => {
      const filters: FindCreatorsDto = {
        page: 1,
        limit: 10,
        search: 'test',
      };

      const mockResponse = {
        data: [mockCreator],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCreatorService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(filters);

      expect(creatorService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty filters', async () => {
      const filters: FindCreatorsDto = {};
      const mockResponse = {
        data: [mockCreator],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCreatorService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(filters);

      expect(creatorService.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a creator by id', async () => {
      const creatorId = 'creator-id-123';

      mockCreatorService.findOneById.mockResolvedValue(mockCreator);

      const result = await controller.findOne(creatorId);

      expect(creatorService.findOneById).toHaveBeenCalledWith(creatorId);
      expect(result).toEqual(mockCreator);
    });

    it('should handle non-existent creator', async () => {
      const creatorId = 'non-existent-id';

      mockCreatorService.findOneById.mockResolvedValue(null);

      const result = await controller.findOne(creatorId);

      expect(creatorService.findOneById).toHaveBeenCalledWith(creatorId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a creator', async () => {
      const creatorId = 'creator-id-123';
      const updateCreatorDto: UpdateCreatorDto = {
        name: 'Updated Name',
      };

      const mockResponse = { message: 'Creator updated successfully' };
      mockCreatorService.updateCreator.mockResolvedValue(mockResponse);

      const result = await controller.update(creatorId, updateCreatorDto);

      expect(creatorService.updateCreator).toHaveBeenCalledWith(
        creatorId,
        updateCreatorDto,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should apply JwtAuthGuard and ApiBearerAuth', () => {
      const guardsMetadata = Reflect.getMetadata(
        '__guards__',
        controller.update,
      );
      expect(guardsMetadata).toBeDefined();

      const apiBearerMetadata = Reflect.getMetadata(
        'swagger/apiBearerAuth',
        controller.update,
      );
      expect(apiBearerMetadata).toBeDefined();
    });

    it('should set HTTP status to OK', () => {
      const httpCodeMetadata = Reflect.getMetadata(
        '__httpCode__',
        controller.update,
      );
      expect(httpCodeMetadata).toBe(HttpStatus.OK);
    });
  });

  describe('remove', () => {
    it('should delete the authenticated creator', async () => {
      const mockResponse = { message: 'Creator deleted successfully' };
      mockCreatorService.deleteOneById.mockResolvedValue(mockResponse);

      const result = await controller.remove(mockUser as User);

      expect(creatorService.deleteOneById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockResponse);
    });

    it('should apply JwtAuthGuard and ApiBearerAuth', () => {
      const guardsMetadata = Reflect.getMetadata(
        '__guards__',
        controller.remove,
      );
      expect(guardsMetadata).toBeDefined();

      const apiBearerMetadata = Reflect.getMetadata(
        'swagger/apiBearerAuth',
        controller.remove,
      );
      expect(apiBearerMetadata).toBeDefined();
    });

    it('should set HTTP status to OK', () => {
      const httpCodeMetadata = Reflect.getMetadata(
        '__httpCode__',
        controller.remove,
      );
      expect(httpCodeMetadata).toBe(HttpStatus.OK);
    });

    it('should use CurrentUser decorator', () => {
      const paramDecorators = Reflect.getMetadata(
        '__routeArguments__',
        CreatorController.prototype,
        'remove',
      );
      expect(paramDecorators).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should propagate service errors in create', async () => {
      const createCreatorDto: CreateCreatorDto = {
        name: 'New Creator',
        email: 'new@example.com',
      };

      const error = new Error('Service error');
      mockCreatorService.createCreator.mockRejectedValue(error);

      await expect(controller.create(createCreatorDto)).rejects.toThrow(error);
    });

    it('should propagate service errors in findAll', async () => {
      const filters: FindCreatorsDto = {};
      const error = new Error('Service error');
      mockCreatorService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(filters)).rejects.toThrow(error);
    });

    it('should propagate service errors in findOne', async () => {
      const creatorId = 'creator-id-123';
      const error = new Error('Service error');
      mockCreatorService.findOneById.mockRejectedValue(error);

      await expect(controller.findOne(creatorId)).rejects.toThrow(error);
    });

    it('should propagate service errors in update', async () => {
      const creatorId = 'creator-id-123';
      const updateCreatorDto: UpdateCreatorDto = { name: 'Updated' };
      const error = new Error('Service error');
      mockCreatorService.updateCreator.mockRejectedValue(error);

      await expect(
        controller.update(creatorId, updateCreatorDto),
      ).rejects.toThrow(error);
    });

    it('should propagate service errors in remove', async () => {
      const error = new Error('Service error');
      mockCreatorService.deleteOneById.mockRejectedValue(error);

      await expect(controller.remove(mockUser as User)).rejects.toThrow(error);
    });
  });
});
