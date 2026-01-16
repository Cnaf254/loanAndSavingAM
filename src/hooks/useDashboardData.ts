import { useAuth } from '@/contexts/AuthContext';
import { useMember } from './useMembers';
import { useMemberSavings, useSavingsStats } from './useSavings';
import { useMemberLoans, useLoanStats, usePendingLoans } from './useLoans';
import { useMemberTransactions, useTransactionStats } from './useTransactions';
import { useGuarantorStats } from './useGuarantors';
import { useMemberStats, usePendingMembers } from './useMembers';

// Hook for member dashboard data
export const useMemberDashboard = () => {
  const { user } = useAuth();
  const { data: member, isLoading: memberLoading } = useMember(user?.id);
  const { data: savings, isLoading: savingsLoading } = useMemberSavings(member?.id);
  const { data: loans, isLoading: loansLoading } = useMemberLoans(member?.id);
  const { data: transactions, isLoading: transactionsLoading } = useMemberTransactions(member?.id, 5);
  const { data: guarantorStats, isLoading: guarantorsLoading } = useGuarantorStats(member?.id);

  const activeLoan = loans?.find(l => ['repaying', 'disbursed'].includes(l.status));

  return {
    member,
    savings,
    loans,
    activeLoan,
    transactions,
    guarantorStats,
    isLoading: memberLoading || savingsLoading || loansLoading || transactionsLoading || guarantorsLoading,
  };
};

// Hook for accountant dashboard data
export const useAccountantDashboard = () => {
  const { data: savingsStats, isLoading: savingsLoading } = useSavingsStats();
  const { data: loanStats, isLoading: loansLoading } = useLoanStats();
  const { data: transactionStats, isLoading: transactionsLoading } = useTransactionStats();

  return {
    savingsStats,
    loanStats,
    transactionStats,
    isLoading: savingsLoading || loansLoading || transactionsLoading,
  };
};

// Hook for admin dashboard data
export const useAdminDashboard = () => {
  const { data: memberStats, isLoading: membersLoading } = useMemberStats();
  const { data: loanStats, isLoading: loansLoading } = useLoanStats();
  const { data: savingsStats, isLoading: savingsLoading } = useSavingsStats();

  return {
    memberStats,
    loanStats,
    savingsStats,
    isLoading: membersLoading || loansLoading || savingsLoading,
  };
};

// Hook for chairperson dashboard data
export const useChairpersonDashboard = () => {
  const { data: pendingMembers, isLoading: membersLoading } = usePendingMembers();
  const { data: pendingLoans, isLoading: loansLoading } = usePendingLoans();

  return {
    pendingMembers,
    pendingLoans,
    isLoading: membersLoading || loansLoading,
  };
};

// Hook for loan committee dashboard data
export const useLoanCommitteeDashboard = () => {
  const { data: pendingLoans, isLoading: loansLoading } = usePendingLoans('loan_committee');
  const { data: loanStats, isLoading: statsLoading } = useLoanStats();

  return {
    pendingLoans,
    loanStats,
    isLoading: loansLoading || statsLoading,
  };
};
