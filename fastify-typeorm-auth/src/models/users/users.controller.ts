import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a user.' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')

  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter users by name.',
  })
  @ApiOperation({ summary: 'Find all users.' })
  @ApiOkResponse({ description: 'Users found and returned.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  findAll(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('tokenVersion') tokenVersion: number,
    @Query('id') id: number,
  ) {
    return this.usersService.findAll({ name, email, id, tokenVersion });
  }

  @Get(':id') 
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: '1',
  })
  @ApiOperation({ summary: 'Find a user by ID.' })
  @ApiOkResponse({ description: 'User found and returned.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID.' })
  @ApiOkResponse({ description: 'User updated and returned.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'User Id',
    example: '1',
  })
  @ApiOperation({
    summary: 'Delete a user by ID',
    description: 'it must match the id in the auth token',
  })
  @ApiOkResponse({ description: 'User found and deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
