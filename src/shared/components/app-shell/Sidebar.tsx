import { NavLink } from 'react-router-dom';
import type { NavItem, SidebarProps } from './app-shell.types';

interface NavContentProps {
  navItems: NavItem[];
  collapsed: boolean;
  onSignOut: () => void;
  isSigningOut: boolean;
  onNavItemClick?: () => void;
}

const linkActive =
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
const linkInactive =
  'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';

const labelTransition =
  'whitespace-nowrap transition-all duration-300 shrink-0';
const labelVisible = 'opacity-100 translate-x-0';
const labelHidden = 'opacity-0 -translate-x-2';

function NavContent({
  navItems,
  collapsed,
  onSignOut,
  isSigningOut,
  onNavItemClick,
}: NavContentProps) {
  return (
    <>
      <ul className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onNavItemClick}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer overflow-hidden',
                  isActive ? linkActive : linkInactive,
                ].join(' ')
              }
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="h-6 w-6 shrink-0 object-contain"
              />
              <span
                className={`${labelTransition} ${collapsed ? labelHidden : labelVisible}`}
              >
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          disabled={isSigningOut}
          className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors w-full cursor-pointer overflow-hidden"
        >
          <img
            src="/LogOutIcon.png"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 shrink-0 object-contain"
          />
          <span
            className={`${labelTransition} ${collapsed ? labelHidden : labelVisible}`}
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </span>
        </button>
      </div>
    </>
  );
}

export function Sidebar({
  navItems,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onSignOut,
  isSigningOut,
}: SidebarProps) {
  const collapseLabel = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={[
          'hidden md:flex flex-col fixed top-0 left-0 h-full z-30 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-[width] duration-300',
          isCollapsed ? 'w-16' : 'w-56',
        ].join(' ')}
      >
        {/* Brand — Logo always fixed, text fades in/out */}
        <div className="flex items-center h-14 border-b border-gray-100 dark:border-gray-700 shrink-0 px-4 gap-3 overflow-hidden">
          <img
            src="/Logo.png"
            alt="TaskOps"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <img
            src="/Brand-Image2.png"
            alt=""
            aria-hidden="true"
            className={`h-6 shrink-0 object-contain transition-all duration-300 ${
              isCollapsed
                ? 'opacity-0 -translate-x-2'
                : 'opacity-100 translate-x-0'
            }`}
          />
        </div>

        <nav aria-label="Main navigation" className="flex flex-col flex-1 py-3">
          <NavContent
            navItems={navItems}
            collapsed={isCollapsed}
            onSignOut={onSignOut}
            isSigningOut={isSigningOut}
          />
        </nav>

        <div className="p-2 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapseLabel}
            aria-expanded={!isCollapsed}
            className="flex items-center justify-center w-full py-2 rounded-md text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden fixed inset-0 z-40 flex"
        >
          <div
            data-testid="mobile-backdrop"
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          <div className="relative z-50 flex flex-col w-64 bg-white dark:bg-gray-900 h-full shadow-xl">
            {/* Brand */}
            <div className="flex items-center h-14 border-b border-gray-100 dark:border-gray-700 shrink-0 px-3 gap-3">
              <img
                src="/Logo.png"
                alt="TaskOps"
                className="h-8 w-8 shrink-0 object-contain"
              />
              <img
                src="/Brand-Image2.png"
                alt=""
                aria-hidden="true"
                className="h-6 object-contain"
              />
            </div>

            <nav
              aria-label="Mobile navigation"
              className="flex flex-col flex-1 p-3"
            >
              <NavContent
                navItems={navItems}
                collapsed={false}
                onSignOut={onSignOut}
                isSigningOut={isSigningOut}
                onNavItemClick={onCloseMobile}
              />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
