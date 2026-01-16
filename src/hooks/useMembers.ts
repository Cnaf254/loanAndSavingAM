import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Member = Database['public']['Tables']['members']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface MemberWithProfile extends Member {
  profiles: Profile | null;
}

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MemberWithProfile[];
    },
  });
};

export const useMember = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['member', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          profiles (*)
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as MemberWithProfile | null;
    },
    enabled: !!userId,
  });
};

export const usePendingMembers = () => {
  return useQuery({
    queryKey: ['members', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          profiles (*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MemberWithProfile[];
    },
  });
};

export const useMemberStats = () => {
  return useQuery({
    queryKey: ['members', 'stats'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('members')
        .select('status', { count: 'exact' });

      if (error) throw error;

      const stats = {
        total: count || 0,
        active: data?.filter(m => m.status === 'active').length || 0,
        pending: data?.filter(m => m.status === 'pending').length || 0,
        suspended: data?.filter(m => m.status === 'suspended').length || 0,
      };

      return stats;
    },
  });
};
