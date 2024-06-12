import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DictionaryDomainEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  popularity!: number;

  @Column({ nullable: true })
  subscribers!: number;
}
