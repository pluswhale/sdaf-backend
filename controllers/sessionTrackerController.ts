import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ActiveSessionTracker, User, Wallet } from '../db/entities';
import { AppDataSource } from '../db/AppDataSource';

const activeSessionsRepo = AppDataSource.getRepository(ActiveSessionTracker);

export const getAllSessions = async (_req: Request, res: Response) => {
  try {
    const sessions = await activeSessionsRepo.find({
      order: { loginTime: 'DESC' },
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: err });
  }
};

export const getLastActiveSessionByUserId = async (req: Request, res: Response): Promise<any> => {
  const userId = req.params.userId;

  try {
    const session = await activeSessionsRepo.findOne({
      where: { user: { id: userId } },
      order: { loginTime: 'DESC' },
    });

    if (!session) {
      return res.status(404).json({ message: 'No sessions found for this user' });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session', error: err });
  }
};

export const createSession = async (req: Request, res: Response): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { loginTime, optionalInfo, userId } = req.body;
  const userRepo = AppDataSource.getRepository(User);
  const trackerRepo = AppDataSource.getRepository(ActiveSessionTracker);

  const user = await userRepo.findOneBy({ id: userId });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const session = trackerRepo.create({
    loginTime,
    optionalInfo,
    user,
  });

  const saved = await trackerRepo.save(session);
  res.status(201).json(saved);
};

export const updateActiveSession = async (req: Request, res: Response) => {
  const { logoutTime, activeSessionId } = req.body;
  const activeSessionRepo = AppDataSource.getRepository(ActiveSessionTracker);

  const activeSession = await activeSessionRepo.findOneBy({ id: activeSessionId });

  if (activeSession) {
    if (logoutTime) {
      activeSession.logoutTime = logoutTime;
      activeSession.duration = Math.floor(
        (new Date(logoutTime).getTime() - new Date(activeSession.loginTime).getTime()) / 1000,
      );

      const updated = await activeSessionRepo.save(activeSession);
      res.status(201).json(updated);
    }
  } else {
    res.status(400).json({ message: 'No active session found' });
  }
};
