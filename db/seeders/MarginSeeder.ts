import { DataSource } from 'typeorm';
import { Margin } from '../entities';

export const seedMargins = async (dataSource: DataSource) => {
  const marginRepository = dataSource.getRepository(Margin);

  const margins = [
    { minPrice: 0, maxPrice: 25, marginValue: 0.35, minOrder: 10 },
    { minPrice: 25, maxPrice: 50, marginValue: 0.09, minOrder: 25 },
    { minPrice: 50, maxPrice: 100, marginValue: 0.08, minOrder: 50 },
    { minPrice: 100, maxPrice: 250, marginValue: 0.07, minOrder: 100 },
    { minPrice: 250, maxPrice: 500, marginValue: 0.06, minOrder: 250 },
    { minPrice: 500, maxPrice: 1000, marginValue: 0.05, minOrder: 500 },
    { minPrice: 1000, maxPrice: 5000, marginValue: 0.04, minOrder: 1000 },
    { minPrice: 5000, maxPrice: 10000, marginValue: 0.03, minOrder: 5000 },
    { minPrice: 10000, maxPrice: 25000, marginValue: 0.02, minOrder: 10000 },
  ];

  for (const margin of margins) {
    const existingMargin = await marginRepository.findOne({
      where: { minPrice: margin.minPrice, maxPrice: margin.maxPrice },
    });
    if (!existingMargin) {
      await marginRepository.save(margin);
    }
  }

  console.log('Margins seeded successfully.');
};

