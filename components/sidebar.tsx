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
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-card border border-border p-2 rounded-lg shadow-sm"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out z-40',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">

          {/* HEADER */}
          <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/30">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
              <img
                src="/cropped-clarusto-logitics-e1756811318321-85x85 .png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col leading-tight">
              <h1 className="text-sm font-semibold text-foreground">
                CRM Portal
              </h1>
              <span className="text-xs text-muted-foreground">
                Management System
              </span>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* FOOTER */}
          <div className="p-3 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}