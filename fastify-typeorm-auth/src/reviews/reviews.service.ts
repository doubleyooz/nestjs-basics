import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly itemsService: ItemsService,
    private readonly entityManager: EntityManager,
  ) {}
  async create(createReviewDto: CreateReviewDto) {
    const item = await this.itemsService.findOne(createReviewDto.itemId);

    const review = new Review(createReviewDto);
    review.item = item;
    return await this.entityManager.save(review);
  }

  async findAll() {
    return await this.reviewsRepository.find();
  }

  async findOne(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['item'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    review.description = updateReviewDto.description ?? review.description;
    review.title = updateReviewDto.title ?? review.title;
    review.rating = updateReviewDto.rating ?? review.rating;

    return await this.entityManager.save(review);
  }

  async remove(id: number) {
    await this.reviewsRepository.delete(id);
  }
}
