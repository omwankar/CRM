'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Briefcase } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/components/ui/empty';

interface Partnership {
  id: string;
  partner_company_name: string;
  partner_name: string;
  contact_person: string;
  contact_email: string;
  partnership_type: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const isAdmin = role !== 'user';

  useEffect(() => {
    fetchPartnerships();
    fetchRole();
  }, []);

  useEffect(() => {
    const filtered = partnerships.filter(
      (part) =>
        part.partner_company_name?.toLowerCase().includes(search.toLowerCase()) ||
        part.partner_name?.toLowerCase().includes(search.toLowerCase()) ||
        part.partnership_type?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPartnerships(filtered);
  }, [search, partnerships]);

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

  const fetchPartnerships = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPartnerships(data || []);
    } catch (error) {
      console.error('Failed to fetch partnerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this partnership?')) return;

    try {
      const { error } = await supabase
        .from('partnerships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPartnerships((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete partnership:', error);
    }
  };

  const getStatus = (start: string, end: string) => {
    const today = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (today < startDate) return 'pending';
    if (today > endDate) return 'ended';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partnerships</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Manage business partnerships'
              : 'View business partnerships'}
          </p>
        </div>

        {/* ✅ ADMIN ONLY */}
        {isAdmin && (
          <Link href="/dashboard/partnerships/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Partnership
            </Button>
          </Link>
        )}
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="flex gap-2 items-center">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by company, partner, or type..."
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

      ) : filteredPartnerships.length === 0 ? (

        /* EMPTY */
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Briefcase />
            </EmptyMedia>

            <EmptyTitle>No partnerships yet</EmptyTitle>

            <EmptyDescription>
              {isAdmin
                ? 'Create your first partnership to get started'
                : 'No partnership data available'}
            </EmptyDescription>
          </EmptyHeader>

          {/* ✅ ADMIN ONLY */}
          {isAdmin && (
            <EmptyContent>
              <Link href="/dashboard/partnerships/new">
                <Button>Add Partnership</Button>
              </Link>
            </EmptyContent>
          )}
        </Empty>

      ) : (

        /* CARDS */
        <div className="grid gap-4">
          {filteredPartnerships.map((part) => {
            const status = getStatus(part.start_date, part.end_date);

            return (
              <Card key={part.id} className="p-6 hover:shadow-md transition">

                <div className="flex items-start justify-between">

                  {/* LEFT */}
                  <div className="flex-1 space-y-2">

                    <h3 className="text-xl font-semibold text-foreground">
                      {part.partner_company_name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Partner: {part.partner_name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Type: {part.partnership_type}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Contact: {part.contact_person} ({part.contact_email})
                    </p>

                    {part.description && (
                      <p className="text-sm text-muted-foreground italic line-clamp-2">
                        {part.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm pt-2">
                      <span className="text-muted-foreground">
                        📅 Start: {new Date(part.start_date).toLocaleDateString()}
                      </span>
                      <span className="text-muted-foreground">
                        ⏳ End: {new Date(part.end_date).toLocaleDateString()}
                      </span>
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}
                    >
                      {status}
                    </span>

                    {/* ✅ ADMIN ONLY */}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Link href={`/dashboard/partnerships/${part.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(part.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}

                  </div>

                </div>

              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}