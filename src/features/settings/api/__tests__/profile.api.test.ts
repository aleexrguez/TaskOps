import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
} from '../profile.api';

const mockFrom = vi.fn();
const mockStorage = vi.fn();

vi.mock('@/shared/services/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    storage: { from: (...args: unknown[]) => mockStorage(...args) },
  },
}));

const userId = '11111111-1111-4111-a111-111111111111';
const profileWithAvatar = {
  id: userId,
  display_name: 'Test User',
  avatar_path: `${userId}/avatar-1000.png`,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const profileWithoutAvatar = {
  ...profileWithAvatar,
  avatar_path: null,
};

// --- Helpers: Supabase chain mocking ---

/**
 * Creates a chainable mock for: .select(...).eq(...).single()
 * Used by fetchProfile, and the initial SELECT in uploadAvatar/removeAvatar.
 */
function mockSelectEqSingle(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq, single };
}

/**
 * Creates a chainable mock for: .update(...).eq(...).select().single()
 * Used by uploadAvatar and removeAvatar after our fix.
 */
function mockUpdateEqSelectSingle(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const selectAfterEq = vi.fn().mockReturnValue({ single });
  const eq = vi.fn().mockReturnValue({ select: selectAfterEq });
  const update = vi.fn().mockReturnValue({ eq });
  return { update, eq, select: selectAfterEq, single };
}

/**
 * Creates a chainable mock for: .upsert(...).select().single()
 * Used by updateProfile.
 */
function mockUpsertSelectSingle(result: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ single });
  const upsert = vi.fn().mockReturnValue({ select });
  return { upsert, select, single };
}

// --- fetchProfile ---

describe('fetchProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns profile with correct display_name when row exists', async () => {
    const chain = mockSelectEqSingle({ data: profileWithAvatar, error: null });
    mockFrom.mockReturnValue(chain);

    const result = await fetchProfile(userId);

    expect(result).toEqual(profileWithAvatar);
    expect(result?.display_name).toBe('Test User');
  });

  it('returns null when row not found (PGRST116)', async () => {
    const chain = mockSelectEqSingle({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });
    mockFrom.mockReturnValue(chain);

    const result = await fetchProfile(userId);

    expect(result).toBeNull();
  });

  it('throws on unexpected Supabase error', async () => {
    const chain = mockSelectEqSingle({
      data: null,
      error: { code: '42000', message: 'DB error' },
    });
    mockFrom.mockReturnValue(chain);

    await expect(fetchProfile(userId)).rejects.toThrow('DB error');
  });
});

// --- updateProfile ---

describe('updateProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upserts display_name and returns full profile', async () => {
    const chain = mockUpsertSelectSingle({
      data: { ...profileWithAvatar, display_name: 'New Name' },
      error: null,
    });
    mockFrom.mockReturnValue(chain);

    const result = await updateProfile(userId, { display_name: 'New Name' });

    expect(result.display_name).toBe('New Name');
    expect(chain.upsert).toHaveBeenCalledWith(
      { id: userId, display_name: 'New Name' },
      { onConflict: 'id' },
    );
  });

  it('throws on upsert error', async () => {
    const chain = mockUpsertSelectSingle({
      data: null,
      error: { message: 'conflict error' },
    });
    mockFrom.mockReturnValue(chain);

    await expect(updateProfile(userId, { display_name: 'X' })).rejects.toThrow(
      'conflict error',
    );
  });

  it('preserves avatar_path in returned profile', async () => {
    const chain = mockUpsertSelectSingle({
      data: profileWithAvatar,
      error: null,
    });
    mockFrom.mockReturnValue(chain);

    const result = await updateProfile(userId, { display_name: 'Test User' });

    expect(result.avatar_path).toBe(`${userId}/avatar-1000.png`);
  });
});

// --- uploadAvatar ---

describe('uploadAvatar', () => {
  beforeEach(() => vi.clearAllMocks());

  function setupUploadMocks(
    currentAvatarPath: string | null,
    updateResult: { data: unknown; error: unknown },
  ) {
    // The function calls from('profiles') twice:
    // 1st: .select('avatar_path').eq('id', userId).single() — read old path
    // 2nd: .update({ avatar_path }).eq('id', userId).select().single() — write new path
    const readChain = mockSelectEqSingle({
      data: { avatar_path: currentAvatarPath },
      error: null,
    });
    const writeChain = mockUpdateEqSelectSingle(updateResult);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return readChain;
      return writeChain;
    });

    mockStorage.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://cdn.example.com/avatar.png' },
      }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    });

    return { readChain, writeChain };
  }

  it('uses update().eq() instead of upsert — does not wipe display_name', async () => {
    const { writeChain } = setupUploadMocks(null, {
      data: { ...profileWithAvatar, avatar_path: `${userId}/avatar-9999.png` },
      error: null,
    });

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await uploadAvatar(userId, file);

    // Verify update() was called (not upsert)
    expect(writeChain.update).toHaveBeenCalled();
    // Verify .eq('id', userId)
    expect(writeChain.eq).toHaveBeenCalledWith('id', userId);
  });

  it('update payload contains ONLY avatar_path — no display_name', async () => {
    const { writeChain } = setupUploadMocks(null, {
      data: profileWithAvatar,
      error: null,
    });

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await uploadAvatar(userId, file);

    const payload = writeChain.update.mock.calls[0][0];
    expect(Object.keys(payload)).toEqual(['avatar_path']);
    expect(payload).not.toHaveProperty('display_name');
    expect(payload).not.toHaveProperty('id');
  });

  it('deletes old avatar from Storage (best-effort)', async () => {
    const oldPath = `${userId}/avatar-old.png`;
    setupUploadMocks(oldPath, {
      data: profileWithAvatar,
      error: null,
    });

    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    await uploadAvatar(userId, file);

    const storageInstance = mockStorage.mock.results[0].value;
    expect(storageInstance.remove).toHaveBeenCalledWith([oldPath]);
  });
});

// --- removeAvatar ---

describe('removeAvatar', () => {
  beforeEach(() => vi.clearAllMocks());

  function setupRemoveMocks(
    currentProfile: unknown,
    updateResult: { data: unknown; error: unknown },
  ) {
    // removeAvatar calls from('profiles') twice:
    // 1st: .select('*').eq('id', userId).single() — read profile
    // 2nd: .update({ avatar_path: null }).eq('id', userId).select().single()
    const readChain = mockSelectEqSingle({
      data: currentProfile,
      error: null,
    });
    const writeChain = mockUpdateEqSelectSingle(updateResult);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return readChain;
      return writeChain;
    });

    return { readChain, writeChain };
  }

  it('uses update().eq() to set avatar_path null — does not wipe display_name', async () => {
    const { writeChain } = setupRemoveMocks(profileWithAvatar, {
      data: profileWithoutAvatar,
      error: null,
    });
    const mockRemove = vi.fn().mockResolvedValue({ error: null });
    mockStorage.mockReturnValue({ remove: mockRemove });

    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    expect(result.display_name).toBe('Test User');
    // Verify update() called with only { avatar_path: null }
    expect(writeChain.update).toHaveBeenCalledWith({ avatar_path: null });
    expect(writeChain.eq).toHaveBeenCalledWith('id', userId);
    // No display_name or id in payload
    const payload = writeChain.update.mock.calls[0][0];
    expect(payload).not.toHaveProperty('display_name');
    expect(payload).not.toHaveProperty('id');
  });

  it('deletes Storage file after DB update (best-effort)', async () => {
    setupRemoveMocks(profileWithAvatar, {
      data: profileWithoutAvatar,
      error: null,
    });
    const mockRemove = vi.fn().mockResolvedValue({ error: null });
    mockStorage.mockReturnValue({ remove: mockRemove });

    await removeAvatar(userId);

    expect(mockRemove).toHaveBeenCalledWith([`${userId}/avatar-1000.png`]);
  });

  it('returns current profile as no-op when no avatar_path exists', async () => {
    const readChain = mockSelectEqSingle({
      data: profileWithoutAvatar,
      error: null,
    });
    mockFrom.mockReturnValue(readChain);

    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    expect(result.display_name).toBe('Test User');
    // Should NOT attempt Storage delete
    expect(mockStorage).not.toHaveBeenCalled();
  });

  it('throws error if profile update fails and does NOT delete from Storage', async () => {
    setupRemoveMocks(profileWithAvatar, {
      data: null,
      error: { message: 'DB error' },
    });

    await expect(removeAvatar(userId)).rejects.toThrow('DB error');
    expect(mockStorage).not.toHaveBeenCalled();
  });

  it('does NOT fail if Storage delete errors (best-effort)', async () => {
    setupRemoveMocks(profileWithAvatar, {
      data: profileWithoutAvatar,
      error: null,
    });
    const mockRemove = vi
      .fn()
      .mockResolvedValue({ error: { message: 'Storage error' } });
    mockStorage.mockReturnValue({ remove: mockRemove });

    const result = await removeAvatar(userId);

    expect(result).toEqual(profileWithoutAvatar);
    expect(mockRemove).toHaveBeenCalledWith([`${userId}/avatar-1000.png`]);
  });
});
