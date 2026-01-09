import { z } from 'zod';

export const activitySchema = z.object({
  code: z.string().length(6, { message: 'Code must be exactly 6 characters' }).transform(val => val.toUpperCase()),
  activityType: z.enum(['Walking', 'Running', 'Cycling', 'Yoga', 'Gym', 'Other']),
  distance: z.number().min(0).optional().default(0),
  duration: z.number().min(0).optional().default(0),
  groupCode: z.string().toUpperCase().optional().nullable()
});

export const validateActivity = (data: unknown) => {
  return activitySchema.safeParse(data);
};
