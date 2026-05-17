import { useRef } from 'react';
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_MAX_SIZE_BYTES,
} from '../types/profile.types';

interface AvatarUploadProps {
  avatarUrl: string | null;
  onUpload: (file: File) => void;
  isPending: boolean;
  error: string | null;
  hasCustomAvatar: boolean;
  onRemove?: () => void;
  isRemoving?: boolean;
}

export function AvatarUpload({
  avatarUrl,
  onUpload,
  isPending,
  error,
  hasCustomAvatar,
  onRemove,
  isRemoving = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !AVATAR_ACCEPTED_TYPES.includes(
        file.type as (typeof AVATAR_ACCEPTED_TYPES)[number],
      )
    ) {
      // Reset input so user can retry
      e.target.value = '';
      return;
    }

    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      e.target.value = '';
      return;
    }

    onUpload(file);
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500"
            aria-label="No avatar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || isRemoving}
            className="cursor-pointer rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Uploading...' : 'Change avatar'}
          </button>
          {hasCustomAvatar && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving || isPending}
              className="cursor-pointer rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRemoving ? 'Removing...' : 'Remove photo'}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload avatar image"
          aria-describedby="avatar-constraints"
        />

        <p
          id="avatar-constraints"
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          JPEG, PNG or WebP. Max 2MB.
        </p>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
