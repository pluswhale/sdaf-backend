import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { HedgineEngineLog } from './HedgineEngineLog';

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

  @OneToMany(type => HedgineEngineLog, heLog => heLog.margin, {nullable: true})
  hedgingEngineLogs: HedgineEngineLog[] | null;
}

