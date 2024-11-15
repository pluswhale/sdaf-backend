import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Margin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  range: string;

  @Column({ type: 'varchar', length: 50 })
  marginValue: string;
}

