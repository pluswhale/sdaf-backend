import { DataSource } from 'typeorm';
import { Margin } from '../db/entities';

export const getAllMargins = async (dataSource: DataSource): Promise<Margin[]> => {
  const marginRepository = dataSource.getRepository(Margin);
  const margins = await marginRepository.find({ order: { minPrice: 'ASC' } });

  return margins;
};

