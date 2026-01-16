import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SavingsAccount = Database['public']['Tables']['savings_accounts']['Row'];

export interface SavingsWithMember extends SavingsAccount {
  members: {
    member_number: string;
    user_id: string;
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  } | null;
}

export const useSavingsAccounts = () => {
  return useQuery({
    queryKey: ['savings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select(`
          *,
          members (
            member_number,
            user_id,
            profiles (first_name, last_name, email)
          )
        `)
        .order('balance', { ascending: false });

      if (error) throw error;
      return data as SavingsWithMember[];
    },
  });
};

export const useMemberSavings = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['savings', 'member', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      
      const { data, error } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();

      if (error) throw error;
      return data as SavingsAccount | null;
    },
    enabled: !!memberId,
  });
};

export const useSavingsStats = () => {
  return useQuery({
    queryKey: ['savings', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select('balance, monthly_contribution, total_interest_earned');

      if (error) throw error;

      const stats = {
        totalBalance: data?.reduce((sum, s) => sum + Number(s.balance), 0) || 0,
        totalMonthlyContributions: data?.reduce((sum, s) => sum + Number(s.monthly_contribution), 0) || 0,
        totalInterestEarned: data?.reduce((sum, s) => sum + Number(s.total_interest_earned), 0) || 0,
        accountCount: data?.length || 0,
      };

      return stats;
    },
  });
};
