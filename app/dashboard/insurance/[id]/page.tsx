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

export default function EditInsurancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    policy_number: '',
    provider: '',
    insurance_type: '',
    coverage_amount: '',
    premium: '',
    start_date: '',
    end_date: '',
    agent_name: '',
    agent_phone: '',
  });

  useEffect(() => {
    fetchInsurance();
  }, [id]);

  const fetchInsurance = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('insurance')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setFormData({
          ...data,
          coverage_amount: data.coverage_amount.toString(),
          premium: data.premium.toString(),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch insurance');
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
        .from('insurance')
        .update({
          ...formData,
          coverage_amount: parseFloat(formData.coverage_amount),
          premium: parseFloat(formData.premium),
        })
        .eq('id', id);

      if (updateError) throw updateError;
      router.push('/dashboard/insurance');
    } catch (err: any) {
      setError(err.message || 'Failed to update insurance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/insurance" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Insurance
      </Link>

      <Card className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Insurance Policy</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <FieldLabel htmlFor="provider">Insurance Provider *</FieldLabel>
            <Input
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="insurance_type">Insurance Type *</FieldLabel>
            <Input
              id="insurance_type"
              name="insurance_type"
              value={formData.insurance_type}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="policy_number">Policy Number *</FieldLabel>
            <Input
              id="policy_number"
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup>
              <FieldLabel htmlFor="coverage_amount">Coverage Amount *</FieldLabel>
              <Input
                id="coverage_amount"
                name="coverage_amount"
                type="number"
                step="0.01"
                value={formData.coverage_amount}
                onChange={handleChange}
                required
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel htmlFor="premium">Annual Premium *</FieldLabel>
              <Input
                id="premium"
                name="premium"
                type="number"
                step="0.01"
                value={formData.premium}
                onChange={handleChange}
                required
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup>
              <FieldLabel htmlFor="start_date">Start Date *</FieldLabel>
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
              <FieldLabel htmlFor="end_date">End Date *</FieldLabel>
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

          <FieldGroup>
            <FieldLabel htmlFor="agent_name">Agent Name</FieldLabel>
            <Input
              id="agent_name"
              name="agent_name"
              value={formData.agent_name}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel htmlFor="agent_phone">Agent Phone</FieldLabel>
            <Input
              id="agent_phone"
              name="agent_phone"
              value={formData.agent_phone}
              onChange={handleChange}
            />
          </FieldGroup>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href="/dashboard/insurance">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
