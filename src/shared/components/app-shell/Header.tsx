import type { HeaderProps } from './app-shell.types';

export function Header({
  appName,
  isCollapsed,
  onToggleMobileSidebar,
}: HeaderProps) {
  return (
    <header
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-10 flex items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 h-14 transition-[padding] duration-300',
        isCollapsed ? 'md:pl-20' : 'md:pl-60',
      ].join(' ')}
    >
      <button
        type="button"
        aria-label="Open menu"
        className="md:hidden mr-3 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
        onClick={onToggleMobileSidebar}
      >
        <span aria-hidden="true">&#9776;</span>
      </button>

      <span className="font-semibold text-gray-900 dark:text-gray-100 md:hidden">
        {appName}
      </span>
    </header>
  );
}
