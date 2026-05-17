import { z } from 'zod/v4';

export const profileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().nullable(),
  avatar_path: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

export const updateProfileInputSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const changePasswordInputSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

export const AVATAR_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
