'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Download, FileText } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/components/ui/empty';

interface Document {
  id: string;
  module: string;
  record_id: string | null;
  file_name: string;
  file_url: string;
}

export default function DocumentsPage() {

  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const isAdmin = role !== 'user';

  useEffect(() => {
    fetchDocuments();
    fetchRole();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();

    const filtered = documents.filter(
      (doc) =>
        doc.file_name?.toLowerCase().includes(term) ||
        doc.module?.toLowerCase().includes(term)
    );

    setFilteredDocuments(filtered);
  }, [search, documents]);

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

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('documents')
        .select('*');

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (path: string) => {
    const { data } = supabase
      .storage
      .from('documents')
      .getPublicUrl(path);

    window.open(data.publicUrl, '_blank');
  };

  const handleDelete = async (doc: Document) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await supabase.storage
        .from('documents')
        .remove([doc.file_url]);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Documents
          </h1>

          <p className="text-muted-foreground">
            {isAdmin
              ? 'Manage document uploads and tracking'
              : 'View and download documents'}
          </p>
        </div>

        {/* ✅ ADMIN ONLY */}
        {isAdmin && (
          <Link href="/dashboard/documents/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        )}

      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by document name or module..."
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

      ) : filteredDocuments.length === 0 ? (

        /* EMPTY */
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>

            <EmptyTitle>
              No documents yet
            </EmptyTitle>

            <EmptyDescription>
              {isAdmin
                ? 'Upload your first document to get started'
                : 'No documents available'}
            </EmptyDescription>
          </EmptyHeader>

          {/* ✅ ADMIN ONLY */}
          {isAdmin && (
            <EmptyContent>
              <Link href="/dashboard/documents/new">
                <Button>Upload Document</Button>
              </Link>
            </EmptyContent>
          )}
        </Empty>

      ) : (

        /* LIST */
        <div className="grid gap-4">

          {filteredDocuments.map((doc) => (

            <Card key={doc.id} className="p-6">

              <div className="flex items-start justify-between">

                <div className="flex-1">

                  <h3 className="text-lg font-semibold text-foreground">
                    {doc.file_name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Module: {doc.module}
                  </p>

                </div>

                <div className="flex gap-2">

                  {/* ✅ Download (ALL) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(doc.file_url)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  {/* ✅ ADMIN ONLY */}
                  {isAdmin && (
                    <>
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
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