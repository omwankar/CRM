'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    document_name: '',
    document_type: '',
    file_path: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setFormData({
          document_name: data.document_name,
          document_type: data.document_type,
          file_path: data.file_path,
          expiry_date: data.expiry_date || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          document_name: formData.document_name,
          document_type: formData.document_type,
          expiry_date: formData.expiry_date || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;
      router.push('/dashboard/documents');
    } catch (err: any) {
      setError(err.message || 'Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/documents" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      <Card className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Document</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <FieldLabel htmlFor="document_name">Document Name *</FieldLabel>
            <Input
              id="document_name"
              name="document_name"
              value={formData.document_name}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="document_type">Document Type *</FieldLabel>
            <Input
              id="document_type"
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>File</FieldLabel>
            <Input
              disabled
              value={formData.file_path}
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-2">To replace the file, delete this document and upload a new one.</p>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="expiry_date">Expiry Date</FieldLabel>
            <Input
              id="expiry_date"
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </FieldGroup>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href="/dashboard/documents">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
