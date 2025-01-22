import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Margin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', default: 0 })
  minPrice: number;

  @Column({ type: 'float', default: 0 })
  maxPrice: number;

  @Column({ type: 'float', default: 0 })
  marginValue: number;

  @Column({ type: 'float', default: 0 })
  minOrder: number;
}

