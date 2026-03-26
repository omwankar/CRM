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

export default function EditBuyerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    buyer_name: '',
    company_type: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    credit_limit: '',
    buyer_portal_link: '', // ✅ NEW
  });

  useEffect(() => {
    if (id) fetchBuyer();
  }, [id]);

  const fetchBuyer = async () => {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // ✅ SAFE MAPPING
        setFormData({
          buyer_name: data.buyer_name || '',
          company_type: data.company_type || '',
          contact_person: data.contact_person || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          credit_limit: data.credit_limit ? data.credit_limit.toString() : '',
          buyer_portal_link: data.buyer_portal_link || '', // ✅ NEW
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buyer');
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
      const updatedData = {
        buyer_name: formData.buyer_name,
        company_type: formData.company_type,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        credit_limit: formData.credit_limit
          ? parseFloat(formData.credit_limit)
          : null,
        buyer_portal_link: formData.buyer_portal_link || null, // ✅ NEW
      };

      const { error } = await supabase
        .from('buyers')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      router.push('/dashboard/buyers');
    } catch (err: any) {
      setError(err.message || 'Failed to update buyer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/buyers" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Buyers
      </Link>

      <Card className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit Buyer</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <FieldGroup>
            <FieldLabel>Buyer Name *</FieldLabel>
            <Input name="buyer_name" value={formData.buyer_name} onChange={handleChange} required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Company Type *</FieldLabel>
            <Input name="company_type" value={formData.company_type} onChange={handleChange} required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Contact Person *</FieldLabel>
            <Input name="contact_person" value={formData.contact_person} onChange={handleChange} required />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-6">
            <FieldGroup>
              <FieldLabel>Email</FieldLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Phone</FieldLabel>
              <Input name="phone" value={formData.phone} onChange={handleChange} />
            </FieldGroup>
          </div>

          <FieldGroup>
            <FieldLabel>Address</FieldLabel>
            <Input name="address" value={formData.address} onChange={handleChange} />
          </FieldGroup>

          <div className="grid grid-cols-3 gap-4">
            <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
            <Input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
            <Input name="zip_code" placeholder="ZIP" value={formData.zip_code} onChange={handleChange} />
          </div>

          <FieldGroup>
            <FieldLabel>Credit Limit</FieldLabel>
            <Input
              name="credit_limit"
              type="number"
              step="0.01"
              value={formData.credit_limit}
              onChange={handleChange}
            />
          </FieldGroup>

          {/* ✅ NEW FIELD */}
          <FieldGroup>
            <FieldLabel>Buyer Portal Link</FieldLabel>
            <Input
              name="buyer_portal_link"
              placeholder="https://buyer-portal.com"
              value={formData.buyer_portal_link}
              onChange={handleChange}
            />
          </FieldGroup>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Link href="/dashboard/buyers">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

        </form>
      </Card>
    </div>
  );
}