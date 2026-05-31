import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskStatus } from '../types';
import {
  STATUS_DOT_STYLES,
  STATUS_I18N_KEYS,
  STATUS_STYLES,
} from './status.constants';

interface StatusSelectorProps {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

const ALL_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function StatusSelector({
  status,
  onStatusChange,
  disabled = false,
}: StatusSelectorProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function handleButtonClick() {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }

  function handleOptionClick(selectedStatus: TaskStatus) {
    onStatusChange(selectedStatus);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleButtonClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {t(STATUS_I18N_KEYS[status])}
        <svg
          className="h-3 w-3"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 z-10 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {ALL_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={status === option}
              onClick={() => handleOptionClick(option)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span
                className={`h-2 w-2 rounded-full ${STATUS_DOT_STYLES[option]}`}
              />
              <span className="flex-1 text-left">
                {t(STATUS_I18N_KEYS[option])}
              </span>
              {status === option && (
                <svg
                  className="h-3 w-3 text-indigo-600 dark:text-indigo-400"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
