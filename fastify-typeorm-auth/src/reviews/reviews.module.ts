import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from 'src/items/items.service';
import { Item } from 'src/items/entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Item])],
  controllers: [ReviewsController],
  providers: [ItemsService, ReviewsService],
})
export class ReviewsModule {}
