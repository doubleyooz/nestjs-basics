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
import { ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { HabitsService } from './habits.service.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { IUser } from '../user/interfaces/user.interface.js';


@ApiTags('habits')
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a habit.' })
  @ApiCreatedResponse({
    description: 'The habit has been successfully created.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')

  async create(@CurrentUser() user: IUser, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create({ ...createHabitDto, userId: user.id });
  }

  @Get()
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter habits by name.',
  })
  @ApiOperation({ summary: 'Find all habits.' })
  @ApiOkResponse({ description: 'Habits found and returned.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  findAll(
    @Query('name') name: string,
    @Query('id') id: number,
  ) {
    return this.habitsService.findAll({ name, id });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'Habit id',
    example: '1',
  })
  @ApiOperation({ summary: 'Find a habit by ID.' })
  @ApiOkResponse({ description: 'Habit found and returned.' })
  @ApiNotFoundResponse({ description: 'Habit not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  findOneById(@Param('id') id: string) {
    return this.habitsService.findOneById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a habit by ID.' })
  @ApiOkResponse({ description: 'Habit updated and returned.' })
  @ApiNotFoundResponse({ description: 'Habit not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  update(@Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto) {
    return this.habitsService.updateOneById(+id, updateHabitDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'Habit Id',
    example: '1',
  })
  @ApiOperation({
    summary: 'Delete a habit by ID',
    description: 'it must match the id in the auth token',
  })
  @ApiOkResponse({ description: 'Habit found and deleted.' })
  @ApiNotFoundResponse({ description: 'Habit not found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  remove(@Param('id') id: string) {
    return this.habitsService.deleteOneById(+id);
  }
}
