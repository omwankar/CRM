import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(data?.role);
    };

    fetchRole();
  }, []);

  return role;
};