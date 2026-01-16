import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Loan = Database['public']['Tables']['loans']['Row'];
type LoanApproval = Database['public']['Tables']['loan_approvals']['Row'];

export interface LoanWithMember extends Loan {
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

export const useLoans = () => {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          members (
            member_number,
            user_id,
            profiles (first_name, last_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LoanWithMember[];
    },
  });
};

export const useMemberLoans = (memberId: string | undefined) => {
  return useQuery({
    queryKey: ['loans', 'member', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Loan[];
    },
    enabled: !!memberId,
  });
};

export const usePendingLoans = (approvalStage?: string) => {
  return useQuery({
    queryKey: ['loans', 'pending', approvalStage],
    queryFn: async () => {
      let query = supabase
        .from('loans')
        .select(`
          *,
          members (
            member_number,
            user_id,
            profiles (first_name, last_name, email)
          )
        `)
        .eq('status', 'pending_approval')
        .order('application_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as LoanWithMember[];
    },
  });
};

export const useApprovedLoans = () => {
  return useQuery({
    queryKey: ['loans', 'approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          members (
            member_number,
            user_id,
            profiles (first_name, last_name, email)
          )
        `)
        .eq('status', 'approved')
        .order('approval_date', { ascending: false });

      if (error) throw error;
      return data as LoanWithMember[];
    },
  });
};

export const useLoanStats = () => {
  return useQuery({
    queryKey: ['loans', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('status, principal_amount, remaining_balance');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(l => l.status === 'pending_approval').length || 0,
        approved: data?.filter(l => l.status === 'approved').length || 0,
        disbursed: data?.filter(l => l.status === 'disbursed').length || 0,
        repaying: data?.filter(l => l.status === 'repaying').length || 0,
        completed: data?.filter(l => l.status === 'completed').length || 0,
        totalAmount: data?.reduce((sum, l) => sum + Number(l.principal_amount), 0) || 0,
        outstandingBalance: data?.filter(l => ['disbursed', 'repaying'].includes(l.status))
          .reduce((sum, l) => sum + Number(l.remaining_balance), 0) || 0,
      };

      return stats;
    },
  });
};

export const useApproveLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      loanId, 
      decision, 
      remarks,
      approverRole 
    }: { 
      loanId: string; 
      decision: 'approved' | 'rejected';
      remarks?: string;
      approverRole: Database['public']['Enums']['app_role'];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create approval record
      const { error: approvalError } = await supabase
        .from('loan_approvals')
        .insert({
          loan_id: loanId,
          approver_id: user.id,
          approver_role: approverRole,
          decision,
          remarks,
        });

      if (approvalError) throw approvalError;

      // Update loan status if rejected or final approval
      if (decision === 'rejected') {
        const { error: updateError } = await supabase
          .from('loans')
          .update({ status: 'rejected' })
          .eq('id', loanId);

        if (updateError) throw updateError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};
