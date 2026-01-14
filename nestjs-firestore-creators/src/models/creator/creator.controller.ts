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
  Query,
} from '@nestjs/common';
import { CreatorService } from './creator.service';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindCreatorsDto } from './dto/find-creators.dto';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { User } from '../user/user.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@Controller('creators')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCreatorDto: CreateCreatorDto) {
    return this.creatorService.createCreator(createCreatorDto);
  }

  @Get()
  findAll(@Query() filters: FindCreatorsDto) {
    return this.creatorService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creatorService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
    return this.creatorService.updateCreator(id, updateCreatorDto);
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
    return this.creatorService.deleteOneById(user.id);
  }
}
