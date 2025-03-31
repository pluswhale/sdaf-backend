import { Request, Response } from 'express';
import { AppDataSource } from '../db/AppDataSource';
import { Margin } from '../db/entities';
import { check, validationResult } from 'express-validator';

export const validateEditMargin = [check('marginValue').isNumeric().withMessage('Margin Value must be a number')];

const marginRepository = AppDataSource.getRepository(Margin);

export const editMarginController = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { marginValue } = req.body;

  if (!marginValue) {
    return res.status(400).json({ message: 'marginValue is required' });
  }

  try {
    const margin = await marginRepository.findOne({ where: { id } });

    if (!margin) {
      return res.status(404).json({ message: 'Margin not found' });
    }

    margin.marginValue = marginValue;
    await marginRepository.save(margin);

    return res.json({ message: 'Margin updated successfully', margin });
  } catch (error) {
    console.error('Error updating margin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const setUpMarginToAll = async (req: Request, res: Response): Promise<any> => {
  const { marginBps } = req.body;

  if (!marginBps) {
    return res.status(400).json({ message: 'marginBps is required' });
  }

  try {
    const margins = await marginRepository.find();

    let updatedMargin: Margin[] = [];

    if (margins.length) {
      updatedMargin = margins.map((margin) => {
        return { ...margin, marginValue: marginBps };
      });
    }

    await marginRepository.save(updatedMargin);

    return res.json({ message: 'Margin updated successfully', updatedMargin });
  } catch (error) {
    console.error('Error updating margin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
