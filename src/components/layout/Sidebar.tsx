
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  Settings,
  Ticket,
  GitBranch,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'ingenieurpr', 'validateur', 'observateur']
  },
  {
    title: 'Gestion des Assets',
    url: '/assets',
    icon: Package,
    roles: ['admin', 'ingenieurpr', 'validateur', 'observateur']
  },
  {
    title: 'Configuration',
    url: '/config',
    icon: Settings,
    roles: ['admin']
  },
  {
    title: 'Tickets',
    url: '/tickets',
    icon: Ticket,
    roles: ['admin', 'ingenieurpr', 'validateur']
  },
  {
    title: 'Workflows',
    url: '/workflows',
    icon: GitBranch,
    roles: ['admin', 'validateur']
  },
  {
    title: 'Calendrier',
    url: '/calendar',
    icon: Calendar,
    roles: ['admin', 'ingenieurpr', 'validateur']
  },
  {
    title: 'Messages',
    url: '/messages',
    icon: MessageSquare,
    roles: ['admin', 'ingenieurpr', 'validateur']
  },
  {
    title: 'Utilisateurs',
    url: '/users',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Logs',
    url: '/logs',
    icon: FileText,
    roles: ['admin']
  }
];

const userMenuItems = [
  {
    title: 'Mon Profil',
    url: '/profile',
    icon: User,
    roles: ['admin', 'ingenieurpr', 'validateur', 'observateur']
  }
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const filteredUserMenuItems = userMenuItems.filter(item => 
    item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="offcanvas">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-sidebar-primary" />
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">PLMLAB</h2>
              <p className="text-xs text-sidebar-foreground/60">Microservices Platform</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredUserMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="p-4 bg-sidebar-accent rounded-lg mx-2 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-sidebar-primary-foreground">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-sidebar-accent-foreground/60 capitalize">
                      {user.role === 'ingenieurpr' ? 'Ingénieur' : user.role}
                    </p>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
