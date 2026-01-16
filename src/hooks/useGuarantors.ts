import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Guarantor = Database['public']['Tables']['guarantors']['Row'];

export interface GuarantorWithDetails extends Guarantor {
  loans: {
    principal_amount: number;
    loan_type: string;
    status: string;
    members: {
      member_number: string;
      profiles: {
        first_name: string;
        last_name: string;
      } | null;
    } | null;
  } | null;
  guarantor_member: {
    member_number: string;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export const useGuarantorsByMember = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['guarantors', 'member', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      
      const { data, error } = await supabase
        .from('guarantors')
        .select(`
          *,
          loans (
            principal_amount,
            loan_type,
            status,
            members (
              member_number,
              profiles (first_name, last_name)
            )
          )
        `)
        .eq('guarantor_member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!memberId,
  });
};

export const useGuarantorStats = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['guarantors', 'stats', memberId],
    queryFn: async () => {
      if (!memberId) return { totalGuaranteed: 0, activeCount: 0, pendingCount: 0 };
      
      const { data, error } = await supabase
        .from('guarantors')
        .select('guaranteed_amount, status')
        .eq('guarantor_member_id', memberId);

      if (error) throw error;

      return {
        totalGuaranteed: data?.filter(g => g.status === 'accepted')
          .reduce((sum, g) => sum + Number(g.guaranteed_amount), 0) || 0,
        activeCount: data?.filter(g => g.status === 'accepted').length || 0,
        pendingCount: data?.filter(g => g.status === 'pending').length || 0,
      };
    },
    enabled: !!memberId,
  });
};
