import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../database/abstract.entity';
import { Item } from '../../items/entities/item.entity';

@Entity()
export class Tag extends AbstractEntity<Tag> {
  @Column()
  title: string;

  @ManyToMany(() => Item, { cascade: true })
  @JoinTable()
  items: Item[];
}
