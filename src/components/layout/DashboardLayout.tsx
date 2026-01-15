import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import logo from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation: NavItem[];
  portalName: string;
  portalSubtitle: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  switchPortals?: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navigation,
  portalName,
  portalSubtitle,
  user,
  switchPortals,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === location.pathname) return true;
    // Handle nested routes
    if (href !== '/' && location.pathname.startsWith(href + '/')) return true;
    return false;
  };

  const handleSignOut = () => {
    // In dummy mode, just redirect to login
    navigate('/login');
  };

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      chairperson: 'bg-purple-100 text-purple-700',
      loan_committee: 'bg-blue-100 text-blue-700',
      management_committee: 'bg-green-100 text-green-700',
      accountant: 'bg-yellow-100 text-yellow-700',
      member: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Addis Mesob" className="h-10 w-10" />
              <div>
                <span className="text-lg font-bold text-sidebar-foreground">{portalName}</span>
                <span className="block text-[9px] text-sidebar-foreground/60 uppercase tracking-widest">
                  {portalSubtitle}
                </span>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.firstName} {user.lastName}
                </p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {formatRoleName(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href) 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Switch Portals & Logout */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            {switchPortals && switchPortals.length > 0 && (
              <>
                {switchPortals.map((portal) => (
                  <Button 
                    key={portal.name}
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    asChild
                  >
                    <Link to={portal.href}>
                      <portal.icon className="h-5 w-5" />
                      <span>{portal.name}</span>
                    </Link>
                  </Button>
                ))}
              </>
            )}
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <div className="flex-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">{user.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {switchPortals?.map((portal) => (
                  <DropdownMenuItem key={portal.name} asChild>
                    <Link to={portal.href} className="cursor-pointer">
                      <portal.icon className="h-4 w-4 mr-2" />
                      {portal.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {switchPortals && switchPortals.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
