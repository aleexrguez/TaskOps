export interface NavItem {
  label: string;
  to: string;
  icon: string;
}

export interface UserMenuProps {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  onSignOut: () => void;
  isSigningOut: boolean;
}

export interface HeaderProps {
  appName: string;
  isCollapsed: boolean;
  onToggleMobileSidebar: () => void;
  userMenu: UserMenuProps;
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

export interface PWAUpdateProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export interface AppShellLayoutProps {
  headerProps: HeaderProps;
  sidebarProps: SidebarProps;
  pwaUpdateProps?: PWAUpdateProps;
  animatedBackground?: boolean;
}
