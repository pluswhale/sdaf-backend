import { DataSource } from 'typeorm';
import { Margin } from '../db/entities';

export const getAllMargins = async (dataSource: DataSource): Promise<Margin[]> => {
  const marginRepository = dataSource.getRepository(Margin);
  return marginRepository.find();
};

