import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entity';
import { Item } from '../items/entities/item.entity';
import { ItemsService } from '../items/items.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Item])],
  controllers: [TagsController],
  providers: [ItemsService, TagsService],
})
export class TagsModule {}
