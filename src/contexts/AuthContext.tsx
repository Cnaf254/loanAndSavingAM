import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface MockUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (role: AppRole) => void;
  signOut: () => void;
  hasRole: (role: AppRole) => boolean;
  isStaff: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STAFF_ROLES: AppRole[] = ['admin', 'accountant', 'loan_committee', 'management_committee', 'chairperson'];

const mockUsers: Record<AppRole, MockUser> = {
  admin: { id: '1', email: 'admin@addismesob.com', first_name: 'Admin', last_name: 'User' },
  chairperson: { id: '2', email: 'chair@addismesob.com', first_name: 'Chairperson', last_name: 'User' },
  management_committee: { id: '3', email: 'management@addismesob.com', first_name: 'Management', last_name: 'User' },
  loan_committee: { id: '4', email: 'loans@addismesob.com', first_name: 'Loan', last_name: 'Officer' },
  accountant: { id: '5', email: 'accountant@addismesob.com', first_name: 'Accountant', last_name: 'User' },
  member: { id: '6', email: 'member@addismesob.com', first_name: 'John', last_name: 'Doe' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted session
    const savedRole = localStorage.getItem('mockUserRole') as AppRole | null;
    if (savedRole && mockUsers[savedRole]) {
      const mockUser = mockUsers[savedRole];
      setUser(mockUser);
      setProfile({
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
        phone: null,
        avatar_url: null,
      });
      setRoles([savedRole]);
    }
    setLoading(false);
  }, []);

  const signIn = (role: AppRole) => {
    const mockUser = mockUsers[role];
    setUser(mockUser);
    setProfile({
      first_name: mockUser.first_name,
      last_name: mockUser.last_name,
      email: mockUser.email,
      phone: null,
      avatar_url: null,
    });
    setRoles([role]);
    localStorage.setItem('mockUserRole', role);
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    setRoles([]);
    localStorage.removeItem('mockUserRole');
  };

  const hasRole = (role: AppRole): boolean => roles.includes(role);

  const isStaff = (): boolean => roles.some(role => STAFF_ROLES.includes(role));

  return (
    <AuthContext.Provider value={{ user, profile, roles, loading, signIn, signOut, hasRole, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};
