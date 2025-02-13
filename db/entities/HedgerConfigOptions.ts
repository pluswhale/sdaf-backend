import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class HedgerConfigOptions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', default: 20.0 })
  profitTrashholdFromDb: number;

  @Column({ type: 'float', default: 600.0 })
  finaliseCheckerTimeRange: number;
}
