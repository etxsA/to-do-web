import { z } from 'zod';

import { PRIORITIES } from '@/types/api';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(120),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  description: z.string().min(1, 'Tell us a bit about you').max(255),
  interest: z.string().max(255).optional(),
});
export type RegisterValues = z.infer<typeof registerSchema>;

/** Shared with task forms (Phase 5) — keeps priority validation in one place. */
export const taskListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  color: z.string().min(1, 'Pick a color').max(255),
  description: z.string().min(1, 'Description is required').max(255),
  iconId: z.number({ message: 'Pick an icon' }).int().positive(),
});
export type TaskListValues = z.infer<typeof taskListSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(PRIORITIES as unknown as [string, ...string[]]),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
  taskListIds: z.array(z.number()),
});
export type TaskValues = z.infer<typeof taskSchema>;
