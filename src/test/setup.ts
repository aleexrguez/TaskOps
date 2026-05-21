import '@testing-library/jest-dom/vitest';
import '@/i18n/i18n';
import { vi } from 'vitest';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
