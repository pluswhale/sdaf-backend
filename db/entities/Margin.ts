import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Margin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  minPrice: number;

  @Column({ type: 'float' })
  maxPrice: number;

  @Column({ type: 'float' })
  marginValue: number;

  @Column({ type: 'float' })
  minOrder: number;
}

