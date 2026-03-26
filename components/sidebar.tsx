'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Award,
  Users,
  Briefcase,
  Shield,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { label: 'Certifications', href: '/dashboard/certifications', icon: Award },
  { label: 'Memberships', href: '/dashboard/memberships', icon: Users },
  { label: 'Partnerships', href: '/dashboard/partnerships', icon: Briefcase },
  { label: 'Insurance', href: '/dashboard/insurance', icon: Shield },
  { label: 'Vendors', href: '/dashboard/vendors', icon: Package },
  { label: 'Buyers', href: '/dashboard/buyers', icon: ShoppingCart },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const { signOut } = await import('@/lib/auth');
    await signOut();
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-card border-r border-border transition-transform duration-200 transform md:relative md:translate-x-0 z-40',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">CRM Portal</h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
