'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import {
  Award,
  Users,
  Shield,
  Package,
  ShoppingCart,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    certifications: 0,
    memberships: 0,
    insurance: 0,
    vendors: 0,
    buyers: 0,
    documents: 0,
  });

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // 🔥 FETCH EVERYTHING
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        console.log('Auth ID:', user.id);

        // ✅ FETCH ROLE
        const { data: roleData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Role fetch error:', error);
        }

        const userRole = roleData?.role || null;
        setRole(userRole);

        console.log('ROLE:', userRole);

        // 🔥 ONLY SUPER ADMIN FETCH USERS
        if (userRole === 'super_admin') {
          const { data: usersData } = await supabase
            .from('users')
            .select('id, email, role');

          setUsers(usersData || []);
        }

        // 🔹 FETCH STATS
        const [
          { count: certCount },
          { count: membCount },
          { count: insCount },
          { count: vendCount },
          { count: buyCount },
          { count: docCount },
        ] = await Promise.all([
          supabase
            .from('certifications')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('insurance')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('buyers')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('documents')
            .select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          certifications: certCount || 0,
          memberships: membCount || 0,
          insurance: insCount || 0,
          vendors: vendCount || 0,
          buyers: buyCount || 0,
          documents: docCount || 0,
        });
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // 🔥 CHANGE ROLE (ONLY SUPER ADMIN)
  const changeRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', id);

    if (!error) {
      const { data } = await supabase
        .from('users')
        .select('id, email, role');

      setUsers(data || []);
    } else {
      console.error('Role update failed:', error);
    }
  };

  // 🔥 WIDGETS
  const widgets = [
    {
      label: 'Certifications',
      value: stats.certifications,
      icon: Award,
      href: '/dashboard/certifications',
    },
    {
      label: 'Memberships',
      value: stats.memberships,
      icon: Users,
      href: '/dashboard/memberships',
    },
    {
      label: 'Insurance',
      value: stats.insurance,
      icon: Shield,
      href: '/dashboard/insurance',
    },
    {
      label: 'Vendors',
      value: stats.vendors,
      icon: Package,
      href: '/dashboard/vendors',
    },
    {
      label: 'Buyers',
      value: stats.buyers,
      icon: ShoppingCart,
      href: '/dashboard/buyers',
    },
    {
      label: 'Documents',
      value: stats.documents,
      icon: FileText,
      href: '/dashboard/documents',
    },
  ];

  // 🔥 ROLE COLORS
  const getRoleColor = (role: string) => {
    if (role === 'super_admin') return 'text-red-500';
    if (role === 'admin') return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your CRM portal
        </p>

        <p className={`mt-2 font-medium ${getRoleColor(role || '')}`}>
          Role: {role || 'Loading...'}
        </p>
      </div>

      {/* STATS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((w) => (
            <Card key={w.label} className="p-6 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((w) => {
            const Icon = w.icon;
            return (
              <Card
                key={w.label}
                className="p-6 cursor-pointer hover:shadow-lg"
                onClick={() => (window.location.href = w.href)}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {w.label}
                    </p>
                    <p className="text-3xl font-bold">
                      {w.value}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-primary opacity-70" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* QUICK START */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">
          Quick Start
        </h2>
        <p className="text-muted-foreground">
          Manage your business data using modules above.
        </p>
      </Card>

      {/* 🔥 USER MANAGEMENT (ONLY SUPER ADMIN) */}
      {role === 'super_admin' && users.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            User & Admin Management
          </h2>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <p className="font-medium">{u.email}</p>
                  <p className={`text-sm ${getRoleColor(u.role)}`}>
                    {u.role}
                  </p>
                </div>

                <select
                  value={u.role}
                  onChange={(e) =>
                    changeRole(u.id, e.target.value)
                  }
                  className="border px-2 py-1 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  
                </select>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}