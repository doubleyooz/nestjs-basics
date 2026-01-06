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
import { CreatorService } from './creator.service';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('creators')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Post()
  create(@Body() createCreatorDto: CreateCreatorDto) {
    return this.creatorService.create(createCreatorDto);
  }

  @Get()
  findAll() {
    return this.creatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creatorService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the authenticated user' })
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
  update(@Param('id') id: string, @Body() updateCreatorDto: UpdateCreatorDto) {
    return this.creatorService.update(id, updateCreatorDto);
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
    return this.creatorService.removeOneById(user.uid);
  }
}
