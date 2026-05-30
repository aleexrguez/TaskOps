import { useTranslation } from 'react-i18next';

interface WeeklyDaysPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export function WeeklyDaysPicker({
  selectedDays,
  onChange,
}: WeeklyDaysPickerProps) {
  const { t } = useTranslation('common');

  const DAYS: { value: number; label: string }[] = [
    { value: 1, label: t('weekday.mon') },
    { value: 2, label: t('weekday.tue') },
    { value: 3, label: t('weekday.wed') },
    { value: 4, label: t('weekday.thu') },
    { value: 5, label: t('weekday.fri') },
    { value: 6, label: t('weekday.sat') },
    { value: 7, label: t('weekday.sun') },
  ];

  function handleToggle(day: number): void {
    const isSelected = selectedDays.includes(day);
    const next = isSelected
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    onChange([...next].sort((a, b) => a - b));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map(({ value, label }) => {
        const isSelected = selectedDays.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => handleToggle(value)}
            className={`min-h-[44px] min-w-[44px] cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors flex items-center justify-center ${
              isSelected
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
