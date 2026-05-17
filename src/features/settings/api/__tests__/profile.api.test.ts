import { describe, expect, it, vi, beforeEach } from 'vitest';
import { removeAvatar } from '../profile.api';

const mockFrom = vi.fn();
const mockStorage = vi.fn();

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    storage: { from: (...args: unknown[]) => mockStorage(...args) },
  },
}));

function setupProfileSelect(profile: { avatar_path: string | null } | null) {
  const selectChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profile, error: null }),
  };
  return selectChain;
}

function setupUpsert(result: { data: unknown; error: unknown }) {
  const upsertChain = {
    upsert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
  return upsertChain;
}

const userId = 'user-123';
const profileWithAvatar = {
  id: userId,
  display_name: 'Test',
  avatar_path: 'user-123/avatar-1000.png',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const profileWithoutAvatar = {
  ...profileWithAvatar,
  avatar_path: null,
};

describe('removeAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates avatar_path to null and deletes Storage file on success', async () => {
    const selectChain = setupProfileSelect(profileWithAvatar);
    const upsertChain = setupUpsert({
      data: profileWithoutAvatar,
      error: null,
    });
    const mockRemove = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation(() => ({
      ...selectChain,
      ...upsertChain,
    }));
    mockStorage.mockReturnValue({ remove: mockRemove });

    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    // Profile updated before Storage delete
    expect(upsertChain.upsert).toHaveBeenCalledWith(
      { id: userId, avatar_path: null },
      { onConflict: 'id' },
    );
    expect(mockRemove).toHaveBeenCalledWith(['user-123/avatar-1000.png']);
  });

  it('returns current profile as no-op when no avatar_path exists', async () => {
    const selectChain = setupProfileSelect(profileWithoutAvatar);

    mockFrom.mockImplementation(() => ({
      ...selectChain,
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: profileWithoutAvatar, error: null }),
        }),
      }),
    }));

    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    // Should NOT attempt Storage delete
    expect(mockStorage).not.toHaveBeenCalled();
  });

  it('throws error if profile update fails and does NOT delete from Storage', async () => {
    const selectChain = setupProfileSelect(profileWithAvatar);
    const upsertChain = setupUpsert({
      data: null,
      error: { message: 'DB error' },
    });

    mockFrom.mockImplementation(() => ({
      ...selectChain,
      ...upsertChain,
    }));

    await expect(removeAvatar(userId)).rejects.toThrow('DB error');
    // Storage should never be called
    expect(mockStorage).not.toHaveBeenCalled();
  });

  it('does NOT fail if Storage delete errors (best-effort)', async () => {
    const selectChain = setupProfileSelect(profileWithAvatar);
    const upsertChain = setupUpsert({
      data: profileWithoutAvatar,
      error: null,
    });
    const mockRemove = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Storage error' } });

    mockFrom.mockImplementation(() => ({
      ...selectChain,
      ...upsertChain,
    }));
    mockStorage.mockReturnValue({ remove: mockRemove });

    // Should NOT throw despite Storage error
    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    expect(mockRemove).toHaveBeenCalledWith(['user-123/avatar-1000.png']);
  });

  it('succeeds when both profile update and Storage delete work', async () => {
    const selectChain = setupProfileSelect(profileWithAvatar);
    const upsertChain = setupUpsert({
      data: profileWithoutAvatar,
      error: null,
    });
    const mockRemove = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation(() => ({
      ...selectChain,
      ...upsertChain,
    }));
    mockStorage.mockReturnValue({ remove: mockRemove });

    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    expect(upsertChain.upsert).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });
});
