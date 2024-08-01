import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Tag } from 'src/models/tags/entities/tag.entity';
@Entity()
export class Item extends AbstractEntity<Item> {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  public: boolean;

  @OneToMany(() => Review, (review) => review.item, { onDelete: 'CASCADE' })
  @JoinColumn()
  reviews: Review[];

  @ManyToMany(() => Tag, {
    cascade: true,
  })
  @JoinTable()
  tags: Tag[];
}
