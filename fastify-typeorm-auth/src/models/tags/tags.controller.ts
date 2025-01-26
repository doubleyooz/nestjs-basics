import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiProduces } from '@nestjs/swagger';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a tag.' })
  @ApiCreatedResponse({
    description: 'A tag has been successfully created.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all tags.' })
  @ApiOkResponse({ description: 'Tags found and returned.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Get(':tagId/:itemId')
  addTagToItem(@Param('tagId') tagId: string, @Param('itemId') itemId: string) {
    return this.tagsService.addTagToItem(+tagId, +itemId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(+id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(+id);
  }
}
