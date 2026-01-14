import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { FindUserByIdDto } from './dto/find-user-by-Id.dto';
import { FindUserDto } from './dto/find-user.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() findUserDto: FindUserDto) {
    return this.userService.findAllUsers(findUserDto);
  }

  @Get(':id')
  findOne(@Param('id') findUserByIdDto: FindUserByIdDto) {
    return this.userService.findById(findUserByIdDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The delete operation was successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  remove(@CurrentUser() user: User) {
    return this.userService.deleteOneById({ id: user.id });
  }
}
