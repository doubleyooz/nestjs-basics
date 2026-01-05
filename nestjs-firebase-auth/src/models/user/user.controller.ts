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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Updae the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The Updae operation was successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete()
  @UseGuards(FirebaseAuthGuard)
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
  remove(@User() user: DecodedIdToken) {
    return this.userService.removeOneById(user.uid);
  }
}
