import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getAvatarPublicUrl,
} from '../api';
import { profileKeys } from './profile.keys';
import type { Profile } from '../types';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: profileKeys.detail(user?.id ?? ''),
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { display_name: string }) =>
      updateProfile(user!.id, input),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<Profile>(
        profileKeys.detail(user!.id),
        updatedProfile,
      );
    },
  });
}

export function useUploadAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(user!.id, file),
    onSuccess: (result) => {
      queryClient.setQueryData<Profile | null>(
        profileKeys.detail(user!.id),
        (old) => (old ? { ...old, avatar_path: result.avatarPath } : old),
      );
    },
  });
}

export function useRemoveAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeAvatar(user!.id),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<Profile>(
        profileKeys.detail(user!.id),
        updatedProfile,
      );
    },
  });
}

export { getAvatarPublicUrl };
