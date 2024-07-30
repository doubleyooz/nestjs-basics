import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const item = new Item(createItemDto);
    return await this.entityManager.save(item);
  }

  async findAll() {
    return await this.itemsRepository.find();
  }

  async findOne(id: number) {
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    const item = await this.findOne(id);

    item.description = updateItemDto.description ?? item.description;
    item.name = updateItemDto.name ?? item.name;
    item.public = updateItemDto.public ?? item.public;

    return await this.entityManager.save(item);
  }

  async remove(id: number) {
    await this.itemsRepository.delete(id);
  }
}
