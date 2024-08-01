import { Column, Entity, ManyToOne } from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { AbstractEntity } from 'src/database/abstract.entity';

@Entity()
export class Review extends AbstractEntity<Review> {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'float' })
  rating: number;

  @ManyToOne(() => Item, (item) => item.reviews, { nullable: false })
  item: Item;
}
