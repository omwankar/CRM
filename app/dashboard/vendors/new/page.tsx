'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    vendor_name: '',
    category: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    payment_terms: '',
    vendor_portal_link: '', // ✅ NEW FIELD
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.from('vendors').insert([
        {
          ...formData,
        },
      ]);

      if (error) throw error;

      router.push('/dashboard/vendors');
    } catch (err: any) {
      setError(err.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/vendors" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Vendors
      </Link>

      <Card className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Add New Vendor</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <FieldGroup>
            <FieldLabel>Vendor Name *</FieldLabel>
            <Input name="vendor_name" value={formData.vendor_name} onChange={handleChange} required />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Category *</FieldLabel>
            <Input name="category" value={formData.category} onChange={handleChange} required />
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
            <FieldLabel>Payment Terms</FieldLabel>
            <Input name="payment_terms" value={formData.payment_terms} onChange={handleChange} />
          </FieldGroup>

          {/* ✅ NEW FIELD */}
          <FieldGroup>
            <FieldLabel>Vendor Portal Link</FieldLabel>
            <Input
              name="vendor_portal_link"
              placeholder="https://vendor-portal.com"
              value={formData.vendor_portal_link}
              onChange={handleChange}
            />
          </FieldGroup>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vendor'}
            </Button>
            <Link href="/dashboard/vendors">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

        </form>
      </Card>
    </div>
  );
}