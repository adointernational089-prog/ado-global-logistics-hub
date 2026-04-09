import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, List, Box, PackageMinus, Users, Search, Bot, Menu, X, Truck, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { role, signOut, user } = useAuth();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/consignments', icon: Package, label: 'Consignments' },
    { to: '/loading-lists', icon: List, label: 'Loading Lists' },
    { to: '/containers', icon: Box, label: 'Containers' },
    { to: '/remaining-ctns', icon: PackageMinus, label: 'Remaining CTNs' },
    { to: '/party-follow-up', icon: Users, label: 'Party Follow Up' },
    { to: '/tracking', icon: Search, label: 'Tracking System' },
    { to: '/ai-helper', icon: Bot, label: 'AI Helper' },
    ...(role === 'admin' ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
  ];

  return (
    <div className="flex min-h-screen w-full">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="p-4 flex items-center gap-2 border-b border-[hsl(var(--sidebar-border))]">
          <Truck className="h-6 w-6 text-[hsl(var(--sidebar-active))] flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold leading-tight">ADO International</h1>
              <p className="text-xs opacity-70">Transport Company</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-fg))] font-semibold'
                    : 'hover:bg-[hsl(var(--sidebar-hover))] opacity-80 hover:opacity-100'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[hsl(var(--sidebar-border))]">
          {!collapsed && user && (
            <div className="px-4 py-2 text-xs opacity-70 truncate">{user.email}</div>
          )}
          <button
            onClick={signOut}
            className="w-full p-3 hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-xs flex items-center gap-2 justify-center text-red-300"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full p-3 border-t border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-xs flex items-center gap-2 justify-center"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <><X className="h-4 w-4" /> <span>Collapse</span></>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
