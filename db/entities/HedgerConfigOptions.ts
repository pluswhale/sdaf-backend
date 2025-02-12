import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class HedgerConfigOptions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'number', default: 20 })
  profitTrashholdFromDb: number;

  @Column({ type: 'number', default: 600 })
  finaliseCheckerTimeRange: number;
}
