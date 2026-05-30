import { useCallback, useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

type Placement = 'bottom' | 'top';

interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
}

function parseValue(value: string): Date {
  return parse(value, 'yyyy-MM-dd', new Date());
}

function formatValue(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatDisplay(date: Date, loc: Locale): string {
  return format(date, 'MMM d, yyyy', { locale: loc });
}

function computePlacement(triggerEl: HTMLElement): Placement {
  const rect = triggerEl.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const minNeeded = 320;
  if (spaceBelow >= minNeeded) return 'bottom';
  if (spaceAbove > spaceBelow) return 'top';
  return 'bottom';
}

export function DatePicker({
  value,
  onChange,
  label,
  id,
  disabled = false,
}: DatePickerProps) {
  const { t, i18n } = useTranslation('common');
  const locale = i18n.resolvedLanguage === 'es' ? es : enUS;

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = value ? parseValue(value) : undefined;
  const displayText = selected
    ? formatDisplay(selected, locale)
    : t('date.selectDate');

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleTriggerClick = useCallback((): void => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      setPlacement(computePlacement(triggerRef.current));
    }
    setOpen((prev) => !prev);
  }, [disabled, open]);

  function handleSelect(date: Date | undefined): void {
    if (date) {
      onChange(formatValue(date));
      setOpen(false);
    }
  }

  function handleToday(): void {
    onChange(formatValue(new Date()));
    setOpen(false);
  }

  function handleClear(): void {
    onChange(undefined);
    setOpen(false);
  }

  const triggerClass =
    'flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-left w-full focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50';

  const popoverPlacement =
    placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div className="taskops-date-picker relative" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <button
        type="button"
        ref={triggerRef}
        id={id}
        onClick={handleTriggerClick}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClass}
      >
        <span className="flex-1">{displayText}</span>
        <span aria-hidden="true" className="text-gray-400">
          📅
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('date.datePickerCalendar')}
          className={`absolute left-0 z-50 max-h-[min(24rem,calc(100vh-2rem))] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800 ${popoverPlacement}`}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={locale}
          />
          <div className="mt-2 flex gap-2 border-t border-gray-100 pt-2 dark:border-gray-700">
            <button
              type="button"
              onClick={handleToday}
              className="flex-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {t('action.today')}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {t('action.clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
