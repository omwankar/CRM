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

export default function NewPartnershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    partner_company_name: '',
    partner_name: '',
    partnership_type: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      partnership_type: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ✅ validation
    if (formData.end_date < formData.start_date) {
      setError('End date cannot be before start date');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('partnerships')
        .insert([formData]);

      if (insertError) throw insertError;

      router.push('/dashboard/partnerships');
    } catch (err: any) {
      setError(err.message || 'Failed to create partnership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/partnerships"
        className="flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Partnerships
      </Link>

      {/* Card */}
      <Card className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Add New Partnership
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Company Name */}
          <FieldGroup>
            <FieldLabel htmlFor="partner_company_name">
              Partner Company Name *
            </FieldLabel>
            <Input
              id="partner_company_name"
              name="partner_company_name"
              placeholder="e.g., Tata Group"
              value={formData.partner_company_name}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          {/* Partner Name */}
          <FieldGroup>
            <FieldLabel htmlFor="partner_name">
              Partner Name *
            </FieldLabel>
            <Input
              id="partner_name"
              name="partner_name"
              placeholder="e.g., Rajesh Sharma"
              value={formData.partner_name}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          {/* Type Dropdown */}
          <FieldGroup>
            <FieldLabel htmlFor="partnership_type">
              Partnership Type *
            </FieldLabel>
            <select
              id="partnership_type"
              name="partnership_type"
              value={formData.partnership_type}
              onChange={handleSelectChange}
              required
              className="w-full border rounded-md p-2 bg-background"
            >
              <option value="">Select Type</option>
              <option value="Strategic">Strategic</option>
              <option value="Logistics">Logistics</option>
              <option value="Supplier">Supplier</option>
              <option value="Technology">Technology</option>
            </select>
          </FieldGroup>

          {/* Contact Person */}
          <FieldGroup>
            <FieldLabel htmlFor="contact_person">
              Contact Person *
            </FieldLabel>
            <Input
              id="contact_person"
              name="contact_person"
              placeholder="Full name"
              value={formData.contact_person}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          {/* Email */}
          <FieldGroup>
            <FieldLabel htmlFor="contact_email">
              Contact Email *
            </FieldLabel>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              placeholder="email@example.com"
              value={formData.contact_email}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          {/* Phone */}
          <FieldGroup>
            <FieldLabel htmlFor="contact_phone">
              Contact Phone
            </FieldLabel>
            <Input
              id="contact_phone"
              name="contact_phone"
              placeholder="+91 9876543210"
              value={formData.contact_phone}
              onChange={handleChange}
            />
          </FieldGroup>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup>
              <FieldLabel htmlFor="start_date">
                Start Date *
              </FieldLabel>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="end_date">
                End Date *
              </FieldLabel>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </FieldGroup>
          </div>

          {/* Description */}
          <FieldGroup>
            <FieldLabel htmlFor="description">
              Description
            </FieldLabel>
            <textarea
              id="description"
              name="description"
              placeholder="Enter partnership details..."
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            />
          </FieldGroup>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Partnership'}
            </Button>

            <Link href="/dashboard/partnerships">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

        </form>
      </Card>
    </div>
  );
}