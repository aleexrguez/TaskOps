import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { RouteSpinner } from '@/shared/components/RouteSpinner';
import { UpdateBanner } from '@/shared/components/UpdateBanner';
import { ParticleBackground } from '@/shared/components/ParticleBackground';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { AppShellLayoutProps } from './app-shell.types';

export function AppShellLayout({
  headerProps,
  sidebarProps,
  pwaUpdateProps,
  animatedBackground,
}: AppShellLayoutProps) {
  const { isCollapsed } = sidebarProps;

  const mainMargin = isCollapsed ? 'md:ml-16' : 'md:ml-56';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {animatedBackground && <ParticleBackground />}
      <Sidebar {...sidebarProps} />
      <Header {...headerProps} />
      {pwaUpdateProps && <UpdateBanner {...pwaUpdateProps} />}

      <main className={`pt-14 ${mainMargin} transition-[margin] duration-300`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<RouteSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
