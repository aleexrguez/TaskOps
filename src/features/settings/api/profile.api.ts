import { supabase } from '@/shared/services/supabase';
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  profileSchema,
} from '../types/profile.types';
import type { Profile } from '../types/profile.types';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null; // Not found
  if (error) throw new Error(error.message);
  return profileSchema.parse(data);
}

export async function updateProfile(
  userId: string,
  input: { display_name: string },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...input }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return map[mimeType] ?? 'jpg';
}

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ avatarPath: string; publicUrl: string }> {
  // Validate type
  if (
    !AVATAR_ACCEPTED_TYPES.includes(
      file.type as (typeof AVATAR_ACCEPTED_TYPES)[number],
    )
  ) {
    throw new Error('Invalid file type. Accepted: JPEG, PNG, WebP.');
  }

  // Validate size
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    throw new Error('File too large. Maximum size is 2MB.');
  }

  // Get old avatar path for cleanup later
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', userId)
    .single();

  const oldAvatarPath = currentProfile?.avatar_path;

  // Build new path (never use original filename)
  const ext = getExtensionFromMime(file.type);
  const newPath = `${userId}/avatar-${Date.now()}.${ext}`;

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(newPath, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  // Update avatar_path in profile (row already exists via signup trigger)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_path: newPath })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    // Cleanup: delete newly uploaded file since profile update failed
    await supabase.storage.from('avatars').remove([newPath]);
    throw new Error(updateError.message);
  }

  // Best-effort: delete old avatar (don't fail if this errors)
  if (oldAvatarPath) {
    await supabase.storage.from('avatars').remove([oldAvatarPath]);
  }

  const publicUrl = getAvatarPublicUrl(newPath);
  return { avatarPath: newPath, publicUrl };
}

export async function removeAvatar(userId: string): Promise<Profile> {
  // Read current profile to get oldAvatarPath
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const oldAvatarPath = currentProfile?.avatar_path;

  // No-op if there's no avatar to remove
  if (!oldAvatarPath) {
    if (currentProfile) return currentProfile;
    // Edge case: no profile row — upsert with null avatar_path
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, avatar_path: null }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Update profile first (DB consistency > Storage cleanup)
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_path: null })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Best-effort: delete old file from Storage (don't fail if this errors)
  await supabase.storage.from('avatars').remove([oldAvatarPath]);

  return data;
}

export function getAvatarPublicUrl(avatarPath: string): string {
  const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
  return data.publicUrl;
}
