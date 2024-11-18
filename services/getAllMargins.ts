import { DataSource } from 'typeorm';
import { Margin } from '../db/entities';

export const getAllMargins = async (dataSource: DataSource): Promise<Margin[]> => {
  const marginRepository = dataSource.getRepository(Margin);
  const margins = await marginRepository.find();

  const sortedMargins = margins.sort((a, b) => {
    // Remove currency symbols and spaces, then split the range
    const [aStart] = a.range
      .replace(/[^0-9\-]/g, '')
      .split('-')
      .map(Number);
    const [bStart] = b.range
      .replace(/[^0-9\-]/g, '')
      .split('-')
      .map(Number);

    // Compare the starting values numerically
    return aStart - bStart;
  });

  console.log('sortedMargins', sortedMargins);

  return sortedMargins;
};

