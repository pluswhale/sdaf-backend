import { DataSource } from 'typeorm';

import { HedgerConfigOptions } from '../db/entities/HedgerConfigOptions';

export const getHedgerConfigOptions = async (dataSource: DataSource): Promise<HedgerConfigOptions[]> => {
  const hedgerOptionsRepository = dataSource.getRepository(HedgerConfigOptions);
  return await hedgerOptionsRepository.find();
};
