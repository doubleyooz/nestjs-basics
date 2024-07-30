import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    private readonly itemsService: ItemsService,
    private readonly entityManager: EntityManager,
  ) {}
  async create(createTagDto: CreateTagDto) {
    const tag = new Tag(createTagDto);

    return await this.entityManager.save(tag);
  }

  async findAll() {
    return await this.tagsRepository.find();
  }

  async findOne(id: number) {
    const tag = await this.tagsRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);

    tag.title = updateTagDto.title ?? tag.title;

    return await this.entityManager.save(tag);
  }

  async remove(id: number) {
    await this.tagsRepository.delete(id);
  }

  async addTagToItem(tagId: number, itemId: number) {
    const tag = await this.findOne(tagId);
    const item = await this.itemsService.findOne(itemId, ['tags']);
    console.log({ item });

    console.log({ tag });

    item.tags = [...item.tags, tag];

    return await this.entityManager.save(item);
  }
}
