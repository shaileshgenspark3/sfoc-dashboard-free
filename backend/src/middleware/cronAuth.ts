import { Request, Response, NextFunction } from 'express';

export const cronAuth = (req: Request, res: Response, next: NextFunction) => {
  // For Railway deployment, we'll use a secret token for authentication
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_AUTH_TOKEN;

  if (!expectedToken) {
    console.warn('⚠️ CRON_AUTH_TOKEN not set, skipping cron authentication');
    return next();
  }

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    console.log('❌ Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};