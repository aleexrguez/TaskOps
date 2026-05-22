import { Outlet } from 'react-router-dom';
import { LandingPage } from '@/features/landing';

export function PublicAuthLayout() {
  return (
    <>
      {/* Background landing page - non-interactive while modal is open */}
      <div aria-hidden="true" style={{ pointerEvents: 'none' }}>
        <LandingPage />
      </div>
      {/* Modal content rendered by child routes */}
      <Outlet />
    </>
  );
}
