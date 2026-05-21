import { enUS, es } from 'date-fns/locale';
import { format, parse, parseISO } from 'date-fns';

const LOCALE_MAP = { en: enUS, es } as const;

export type DateLang = keyof typeof LOCALE_MAP;

export function getDateLocale(lang: DateLang = 'en') {
  return LOCALE_MAP[lang] ?? enUS;
}

/**
 * Parse an ISO string safely, handling both date-only (YYYY-MM-DD) and
 * full ISO datetime formats.
 *
 * Date-only strings are parsed as LOCAL dates using date-fns `parse` to
 * avoid the timezone-offset shift that `new Date('YYYY-MM-DD')` causes
 * (which interprets date-only strings as UTC midnight).
 */
function parseDateSafe(iso: string): Date {
  if (iso.length === 10 && !iso.includes('T')) {
    return parse(iso, 'yyyy-MM-dd', new Date());
  }
  return parseISO(iso);
}

/** Format any ISO string as "MMM d, yyyy" (e.g. "May 10, 2026"). */
export function formatDate(iso: string, lang: DateLang = 'en'): string {
  return format(parseDateSafe(iso), 'MMM d, yyyy', {
    locale: LOCALE_MAP[lang],
  });
}

/** Format a full ISO datetime as "MMM d, yyyy · h:mm a" (e.g. "May 10, 2026 · 3:45 PM"). */
export function formatDateTime(iso: string, lang: DateLang = 'en'): string {
  return format(parseISO(iso), "MMM d, yyyy '·' h:mm a", {
    locale: LOCALE_MAP[lang],
  });
}
