'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Globe, Package } from 'lucide-react';

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/components/ui/empty';

interface Vendor {
  id: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  category: string;
  payment_terms: string;
  status: 'active' | 'inactive';
  vendor_portal_link?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const isAdmin = role !== 'user';

  useEffect(() => {
    fetchVendors();
    fetchRole();
  }, []);

  useEffect(() => {
    const filtered = vendors.filter(
      (v) =>
        v.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        v.contact_person?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVendors(filtered);
  }, [search, vendors]);

  const fetchRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setRole(data?.role || null);
    } catch (err) {
      console.error('Failed to fetch role:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVendors(data || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Failed to delete vendor:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage vendor relationships' : 'View vendors'}
          </p>
        </div>

        {isAdmin && (
          <Link href="/dashboard/vendors/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Vendor
            </Button>
          </Link>
        )}
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="flex gap-2 items-center">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent"
          />
        </div>
      </Card>

      {/* CONTENT */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse" />
          ))}
        </div>
      ) : filteredVendors.length === 0 ? (

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>

            <EmptyTitle>No vendors yet</EmptyTitle>

            <EmptyDescription>
              {isAdmin
                ? 'Create your first vendor'
                : 'No vendor data available'}
            </EmptyDescription>
          </EmptyHeader>

          {isAdmin && (
            <EmptyContent>
              <Link href="/dashboard/vendors/new">
                <Button>Add Vendor</Button>
              </Link>
            </EmptyContent>
          )}
        </Empty>

      ) : (

        <div className="grid gap-4">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="p-6">

              <div className="flex justify-between">

                {/* LEFT */}
                <div>
                  <h3 className="text-lg font-semibold">
                    {vendor.vendor_name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {vendor.contact_person}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {vendor.email} • {vendor.phone}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {vendor.category} • {vendor.payment_terms}
                  </p>

                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getStatusBadge(vendor.status)}`}>
                    {vendor.status}
                  </span>
                </div>

                {/* RIGHT */}
                <div className="flex gap-2 items-start">

                  {isAdmin && (
                    <>
                      <Link href={`/dashboard/vendors/${vendor.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vendor.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}

                  {vendor.vendor_portal_link && (
                    <a
                      href={vendor.vendor_portal_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <Globe className="w-4 h-4 text-blue-500" />
                      </Button>
                    </a>
                  )}

                </div>

              </div>

            </Card>
          ))}
        </div>

      )}

    </div>
  );
}