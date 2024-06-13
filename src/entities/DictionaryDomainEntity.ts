import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class DictionaryDomainEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  popularity!: number;

  @Column({ nullable: true })
  subscribers!: number;

  @Column({ name: 'updated_at', type: 'text', nullable: true })
  updatedAt!: string; // ISO string
}
