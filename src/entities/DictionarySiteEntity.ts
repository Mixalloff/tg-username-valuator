import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DictionarySiteEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}
