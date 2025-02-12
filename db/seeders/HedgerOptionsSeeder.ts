import { DataSource } from 'typeorm';
import { CurrencyForBotOrder } from '../../types/enum';
import { HedgerConfigOptions } from '../entities/HedgerConfigOptions';

export const hedgerOptionsSeeder = async (dataSource: DataSource) => {
  const hedgerConfigRepo = dataSource.getRepository(HedgerConfigOptions);

  const hedgerOptions = [
    {
      profitTrashholdFromDb: 20,
      finaliseCheckerTimeRange: 600,
    },
  ];

  const existingHedgerOptions = await hedgerConfigRepo.find();

  if (existingHedgerOptions?.length) {
    return;
  } else {
    for (let hedgerOption of hedgerOptions) {
      await hedgerConfigRepo.save(hedgerOption);
    }
  }

  console.log('Hedger options  seeded successfully.');
};
