'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Globe, ShoppingCart } from 'lucide-react';

interface Buyer {
  id: string;
  buyer_name: string;
  contact_person: string;
  email: string;
  phone: string;
  company_type: string;
  last_purchase: string;
  status: 'active' | 'inactive';
  buyer_portal_link?: string;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const isAdmin = role !== 'user';

  useEffect(() => {
    fetchBuyers();
    fetchRole();
  }, []);

  useEffect(() => {
    const filtered = buyers.filter(
      (b) =>
        b.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.contact_person?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBuyers(filtered);
  }, [search, buyers]);

  const fetchRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    setRole(data?.role || null);
  };

  const fetchBuyers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBuyers(data || []);
    } catch (error) {
      console.error('Failed to fetch buyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this buyer?')) return;

    try {
      const { error } = await supabase
        .from('buyers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBuyers((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Failed to delete buyer:', error);
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
          <h1 className="text-3xl font-bold">Buyers</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Manage buyer relationships'
              : 'View buyer information'}
          </p>
        </div>

        {/* ✅ Only Admin can see */}
        {isAdmin && (
          <Link href="/dashboard/buyers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Buyer
            </Button>
          </Link>
        )}
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="flex gap-2 items-center">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by buyer name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 bg-transparent"
          />
        </div>
      </Card>

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </Card>
          ))}
        </div>
      ) : filteredBuyers.length === 0 ? (

        /* EMPTY */
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No buyers yet</h3>
          <p className="text-muted-foreground mb-4">
            {isAdmin
              ? 'Create your first buyer to get started'
              : 'No buyer data available'}
          </p>

          {isAdmin && (
            <Link href="/dashboard/buyers/new">
              <Button>Add Buyer</Button>
            </Link>
          )}
        </div>

      ) : (

        /* CARDS */
        <div className="grid gap-4">
          {filteredBuyers.map((buyer) => (
            <Card key={buyer.id} className="p-6">
              <div className="flex items-start justify-between">

                {/* LEFT */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {buyer.buyer_name}
                    </h3>

                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(buyer.status)}`}>
                      {buyer.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    Type: {buyer.company_type}
                  </p>

                  <p className="text-sm text-muted-foreground mb-3">
                    Contact: {buyer.contact_person}
                  </p>

                  <div className="flex gap-6 text-sm flex-wrap">
                    <span>Email: {buyer.email}</span>
                    <span>Phone: {buyer.phone}</span>
                    <span>
                      Last Purchase:{' '}
                      {buyer.last_purchase
                        ? new Date(buyer.last_purchase).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex gap-2">

                  {/* ✅ Admin Only */}
                  {isAdmin && (
                    <>
                      <Link href={`/dashboard/buyers/${buyer.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(buyer.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}

                  {/* 🌐 Portal (Everyone can access) */}
                  {buyer.buyer_portal_link ? (
                    <a
                      href={buyer.buyer_portal_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" title="Open Buyer Portal">
                        <Globe className="w-4 h-4 text-blue-500" />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="ghost" size="sm" disabled title="No Portal">
                      <Globe className="w-4 h-4 text-gray-400" />
                    </Button>
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