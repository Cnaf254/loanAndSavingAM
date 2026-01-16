import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

export interface TransactionWithMember extends Transaction {
  members: {
    member_number: string;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

export const useTransactions = (limit?: number) => {
  return useQuery({
    queryKey: ['transactions', limit],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          members (
            member_number,
            profiles (first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TransactionWithMember[];
    },
  });
};

export const useMemberTransactions = (memberId: string | undefined, limit?: number) => {
  return useQuery({
    queryKey: ['transactions', 'member', memberId, limit],
    queryFn: async () => {
      if (!memberId) return [];
      
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!memberId,
  });
};

export const useTransactionStats = () => {
  return useQuery({
    queryKey: ['transactions', 'stats'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_type, amount, created_at')
        .gte('created_at', startOfMonth);

      if (error) throw error;

      const stats = {
        monthlyDeposits: data?.filter(t => t.transaction_type === 'savings_deposit')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        monthlyRepayments: data?.filter(t => t.transaction_type === 'loan_repayment')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        monthlyDisbursements: data?.filter(t => t.transaction_type === 'loan_disbursement')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        transactionCount: data?.length || 0,
      };

      return stats;
    },
  });
};
