export interface NavItem {
  label: string;
  to: string;
  icon: string;
}

export interface HeaderProps {
  appName: string;
  isCollapsed: boolean;
  onToggleMobileSidebar: () => void;
}

export interface SidebarProps {
  navItems: NavItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}

export interface AppShellLayoutProps {
  headerProps: HeaderProps;
  sidebarProps: SidebarProps;
}
