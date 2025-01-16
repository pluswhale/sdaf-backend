import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Margin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', nullable: true })
  minPrice: number | null;

  @Column({ type: 'float', nullable: true })
  maxPrice: number | null;

  @Column({ type: 'float', nullable: true })
  marginValue: number | null;

  @Column({ type: 'float', nullable: true })
  minOrder: number | null;
}

