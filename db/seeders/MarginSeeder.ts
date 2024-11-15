import { DataSource } from 'typeorm';
import { Margin } from '../entities';

export const seedMargins = async (dataSource: DataSource) => {
  const marginRepository = dataSource.getRepository(Margin);

  const margins = [
    { range: '$0 – $25', marginValue: '1.0' },
    { range: '$25 – $50', marginValue: '0.9' },
    { range: '$50 – $100', marginValue: '0.8' },
    { range: '$100 – $250', marginValue: '0.7' },
    { range: '$250 – $500', marginValue: '0.6' },
    { range: '$500 – $1,000', marginValue: '0.5' },
    { range: '$1000 – $5,000', marginValue: '0.4' },
    { range: '$5000 – $10,000', marginValue: '0.3' },
    { range: '$10,000 – $25,000', marginValue: '0.25' },
  ];

  for (const margin of margins) {
    const existingMargin = await marginRepository.findOne({ where: { range: margin.range } });
    if (!existingMargin) {
      await marginRepository.save(margin);
    }
  }

  console.log('Margins seeded successfully.');
};

