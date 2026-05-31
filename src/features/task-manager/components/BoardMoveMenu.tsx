import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskStatus } from '../types';
import { getAvailableStatusTransitions } from '../utils/status-transitions';
import { STATUS_DOT_STYLES, STATUS_I18N_KEYS } from './status.constants';

interface BoardMoveMenuProps {
  currentStatus: TaskStatus;
  onMove: (newStatus: TaskStatus) => void;
}

export function BoardMoveMenu({ currentStatus, onMove }: BoardMoveMenuProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const destinations = getAvailableStatusTransitions(currentStatus);

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

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function handleDestinationClick(e: React.MouseEvent, status: TaskStatus) {
    e.stopPropagation();
    onMove(status);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-h-[44px] min-w-[44px] lg:min-h-8 lg:min-w-8"
      >
        {t('action.move')}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 z-10 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {destinations.map((status) => (
            <button
              key={status}
              type="button"
              role="menuitem"
              onClick={(e) => handleDestinationClick(e, status)}
              aria-label={t('action.moveTo', {
                status: t(STATUS_I18N_KEYS[status]),
              })}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span
                className={`h-2 w-2 rounded-full ${STATUS_DOT_STYLES[status]}`}
                aria-hidden="true"
              />
              <span className="flex-1 text-left">
                {t(STATUS_I18N_KEYS[status])}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
