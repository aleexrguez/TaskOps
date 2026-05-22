import { Footer } from './Footer';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <Footer />
    </div>
  );
}
