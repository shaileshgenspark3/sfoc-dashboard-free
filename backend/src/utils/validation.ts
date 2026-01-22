import { z } from 'zod';

export const activitySchema = z.object({
  code: z.string().min(1, { message: 'Code is required' }).transform(val => val.toUpperCase()),
  activityType: z.enum(['Walking', 'Running', 'Cycling', 'Yoga', 'Gym', 'Other']),
  distance: z.number().min(0).optional().default(0),
  duration: z.number().min(0).optional().default(0),
  groupCode: z.string().toUpperCase().optional().nullable()
});

export const validateActivity = (data: unknown) => {
  return activitySchema.safeParse(data);
};

export const determineGroupCode = (code: string): string | null => {
  const codeNum = parseInt(code);
  if (isNaN(codeNum)) return null;

  // 1-999: SQUAD_1 to SQUAD_50 (20 users per squad)
  if (codeNum >= 1 && codeNum <= 999) {
    const squadNum = Math.ceil(codeNum / 20);
    return `SQUAD_${squadNum}`;
  }

  // Group by thousands: 1000-1999 -> '1000', 10000-10999 -> '10000', etc.
  // Supports up to 50,000 and beyond dynamically.
  if (codeNum >= 1000) {
    const groupStart = Math.floor(codeNum / 1000) * 1000;
    return groupStart.toString();
  }

  return null;
};
