import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  PiggyBank, 
  Wallet, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface SavingsAccount {
  balance: number;
  monthly_contribution: number;
  total_interest_earned: number;
}

interface Loan {
  remaining_balance: number;
  status: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  description: string | null;
  amount: number;
  created_at: string;
}

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch savings account
      const { data: savingsData } = await supabase
        .from('savings_accounts')
        .select('balance, monthly_contribution, total_interest_earned')
        .single();
      
      if (savingsData) {
        setSavingsAccount(savingsData);
      }

      // Fetch active loan
      const { data: loanData } = await supabase
        .from('loans')
        .select('remaining_balance, status')
        .in('status', ['approved', 'disbursed', 'repaying'])
        .limit(1)
        .maybeSingle();
      
      if (loanData) {
        setActiveLoan(loanData);
      }

      // Fetch recent transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('id, transaction_type, description, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (txData) {
        setTransactions(txData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate('/');
  };

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
    { name: "Savings", icon: PiggyBank, href: "/dashboard/savings", active: false },
    { name: "Loans", icon: Wallet, href: "/dashboard/loans", active: false },
    { name: "Statements", icon: FileText, href: "/dashboard/statements", active: false },
    { name: "Guarantors", icon: Users, href: "/dashboard/guarantors", active: false },
    { name: "Settings", icon: Settings, href: "/dashboard/settings", active: false },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      savings_deposit: 'Savings Deposit',
      savings_withdrawal: 'Savings Withdrawal',
      loan_disbursement: 'Loan Disbursement',
      loan_repayment: 'Loan Repayment',
      interest_earned: 'Interest Earned',
      fee: 'Fee'
    };
    return labels[type] || type;
  };

  const isCredit = (type: string) => {
    return ['savings_deposit', 'loan_disbursement', 'interest_earned'].includes(type);
  };

  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Member';
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : 'M';

  const stats = [
    { 
      title: "Total Savings", 
      value: `ETB ${formatCurrency(savingsAccount?.balance || 0)}`, 
      change: "+12.5%", 
      trend: "up",
      icon: PiggyBank 
    },
    { 
      title: "Active Loan", 
      value: activeLoan ? `ETB ${formatCurrency(activeLoan.remaining_balance)}` : "No active loan", 
      change: activeLoan ? "Balance remaining" : "Apply now", 
      trend: "neutral",
      icon: Wallet 
    },
    { 
      title: "Monthly Contribution", 
      value: `ETB ${formatCurrency(savingsAccount?.monthly_contribution || 0)}`, 
      change: "Per month", 
      trend: "neutral",
      icon: Calendar 
    },
    { 
      title: "Total Interest Earned", 
      value: `ETB ${formatCurrency(savingsAccount?.total_interest_earned || 0)}`, 
      change: "+5.2%", 
      trend: "up",
      icon: TrendingUp 
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Addis Mesob" className="h-10 w-10" />
              <div>
                <span className="text-lg font-bold text-sidebar-foreground">Addis Mesob</span>
                <span className="block text-[9px] text-sidebar-foreground/60 uppercase tracking-widest">
                  Member Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm w-40"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${
                        index === 0 ? 'bg-primary/10 text-primary' :
                        index === 1 ? 'bg-accent/10 text-accent' :
                        index === 2 ? 'bg-secondary text-secondary-foreground' :
                        'bg-success/10 text-success'
                      }`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      {stat.trend === 'up' && (
                        <div className="flex items-center gap-1 text-success text-sm">
                          <ArrowUpRight className="h-4 w-4" />
                          {stat.change}
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions & Recent Transactions */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Button variant="default" className="w-full justify-start gap-3" asChild>
                      <Link to="/loan-application">
                        <Wallet className="h-5 w-5" />
                        Apply for Loan
                      </Link>
                    </Button>
                    <Button variant="secondary" className="w-full justify-start gap-3">
                      <PiggyBank className="h-5 w-5" />
                      Update Savings Plan
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <FileText className="h-5 w-5" />
                      Download Statement
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Users className="h-5 w-5" />
                      Manage Guarantors
                    </Button>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                    <Link to="/dashboard/statements" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {transactions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No transactions yet. Your transaction history will appear here.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                isCredit(transaction.transaction_type) 
                                  ? 'bg-success/10 text-success' 
                                  : 'bg-accent/10 text-accent'
                              }`}>
                                {isCredit(transaction.transaction_type) 
                                  ? <ArrowDownRight className="h-5 w-5" />
                                  : <ArrowUpRight className="h-5 w-5" />
                                }
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {transaction.description || getTransactionLabel(transaction.transaction_type)}
                                </div>
                                <div className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</div>
                              </div>
                            </div>
                            <div className={`font-semibold ${
                              isCredit(transaction.transaction_type) ? 'text-success' : 'text-foreground'
                            }`}>
                              {isCredit(transaction.transaction_type) ? '+' : '-'} ETB {formatCurrency(transaction.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
