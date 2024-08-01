import { BeforeInsert, Column, Entity, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractEntity } from '../../../database/abstract.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Index()
  @Column({ unique: true })
  email: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.HASH_SALT),
    );
    console.log('password hashed...');
  }
  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({ default: 1 })
  tokenVersion: number;
}
