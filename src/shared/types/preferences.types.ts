import { z } from 'zod';

export const themePreferenceSchema = z.enum(['light', 'dark', 'system']);
export type ThemePreference = z.infer<typeof themePreferenceSchema>;

export const retentionPolicySchema = z.enum(['5d', '7d', '30d', 'never']);
export type RetentionPolicy = z.infer<typeof retentionPolicySchema>;
