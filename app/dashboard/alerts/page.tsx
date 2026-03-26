'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'certification' | 'membership' | 'insurance' | 'partnership';
  name: string;
  expiry_date: string;
  days_until_expiry: number;
  status: 'expired' | 'expiring_soon' | 'ok';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    cert_expiry_days: 30,
    membership_expiry_days: 30,
    insurance_expiry_days: 30,
  });

  useEffect(() => {
    fetchAlertsAndSettings();
  }, []);

  const fetchAlertsAndSettings = async () => {
    try {
      setLoading(true);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      // Fetch user settings
      const { data: settingsData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings({
          cert_expiry_days: settingsData.cert_expiry_days || 30,
          membership_expiry_days: settingsData.membership_expiry_days || 30,
          insurance_expiry_days: settingsData.insurance_expiry_days || 30,
        });
      }

      // Fetch all items that might be expiring
      const today = new Date();
      const allAlerts: Alert[] = [];

      // Check certifications
      const { data: certs } = await supabase.from('certifications').select('*');
      if (certs) {
        certs.forEach((cert) => {
          const expiry = new Date(cert.expiry_date);
          const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= settings.cert_expiry_days) {
            allAlerts.push({
              id: cert.id,
              type: 'certification',
              name: cert.name,
              expiry_date: cert.expiry_date,
              days_until_expiry: daysUntil,
              status: daysUntil < 0 ? 'expired' : daysUntil < 1 ? 'expiring_soon' : 'ok',
            });
          }
        });
      }

      // Check memberships
      const { data: memberships } = await supabase.from('memberships').select('*');
      if (memberships) {
        memberships.forEach((mem) => {
          const expiry = new Date(mem.renewal_date);
          const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= settings.membership_expiry_days) {
            allAlerts.push({
              id: mem.id,
              type: 'membership',
              name: mem.organization_name,
              expiry_date: mem.renewal_date,
              days_until_expiry: daysUntil,
              status: daysUntil < 0 ? 'expired' : daysUntil < 1 ? 'expiring_soon' : 'ok',
            });
          }
        });
      }

      // Check insurance
      const { data: insurances } = await supabase.from('insurance').select('*');
      if (insurances) {
        insurances.forEach((ins) => {
          const expiry = new Date(ins.end_date);
          const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= settings.insurance_expiry_days) {
            allAlerts.push({
              id: ins.id,
              type: 'insurance',
              name: `${ins.provider} (${ins.insurance_type})`,
              expiry_date: ins.end_date,
              days_until_expiry: daysUntil,
              status: daysUntil < 0 ? 'expired' : daysUntil < 1 ? 'expiring_soon' : 'ok',
            });
          }
        });
      }

      // Sort by days until expiry (expired first)
      allAlerts.sort((a, b) => a.days_until_expiry - b.days_until_expiry);
      setAlerts(allAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertStyles = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-50 border-red-200';
      case 'expiring_soon':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getAlertIcon = (status: string) => {
    return status === 'expired' || status === 'expiring_soon' ? (
      <AlertCircle className="w-5 h-5 text-red-600" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-600" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusText = (daysUntil: number) => {
    if (daysUntil < 0) return `Expired ${Math.abs(daysUntil)} days ago`;
    if (daysUntil === 0) return 'Expires today';
    if (daysUntil === 1) return 'Expires tomorrow';
    return `Expires in ${daysUntil} days`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alerts & Expiries</h1>
        <p className="text-muted-foreground">Monitor upcoming expirations across all modules</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Empty
          icon="CheckCircle"
          title="All clear!"
          description="No items expiring soon. Keep monitoring your CRM."
        />
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card
              key={`${alert.type}-${alert.id}`}
              className={`border-l-4 p-6 ${getAlertStyles(alert.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getAlertIcon(alert.status)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{alert.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-60 text-gray-700">
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {getStatusText(alert.days_until_expiry)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expiry Date: {formatDate(alert.expiry_date)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
