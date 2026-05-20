import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { UserMenuProps } from './app-shell.types';

export function UserMenu({
  displayName,
  email,
  avatarUrl,
  onSignOut,
  isSigningOut,
}: UserMenuProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('a11y.userMenu')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center h-11 w-11 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-500 transition-shadow"
      >
        <img
          src={avatarUrl ?? '/image-noPhotoPerfil.png'}
          alt={displayName ?? 'User avatar'}
          className="h-10 w-10 rounded-full object-cover"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 z-20 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src={avatarUrl ?? '/image-noPhotoPerfil.png'}
              alt={displayName ?? 'User avatar'}
              className="h-12 w-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              {displayName ? (
                <>
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {email}
                  </p>
                </>
              ) : (
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {email}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700" />

          <Link
            to="/app/account"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {t('nav.account')}
          </Link>

          <Link
            to="/app/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            {t('nav.settings')}
          </Link>

          <div className="border-t border-gray-200 dark:border-gray-700" />

          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left disabled:opacity-50"
          >
            {isSigningOut ? t('nav.signingOut') : t('nav.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
