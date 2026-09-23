import { PartialType } from '@nestjs/mapped-types';
import { CreateHabitDto } from './create-habit.dto.js';
import { IsNumber, IsOptional } from 'class-validator';

export class FindHabitsDto extends PartialType(CreateHabitDto) {
  @IsNumber()
  @IsOptional()
  id?: number;
}
