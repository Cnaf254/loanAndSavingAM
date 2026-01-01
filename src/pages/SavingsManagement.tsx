import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  PiggyBank, 
  TrendingUp,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const contributionSchema = z.object({
  monthly_contribution: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 100, {
      message: "Minimum contribution is ETB 100",
    })
    .refine((val) => val <= 50000, {
      message: "Maximum contribution is ETB 50,000",
    }),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

interface SavingsAccount {
  id: string;
  balance: number;
  monthly_contribution: number;
  total_interest_earned: number;
  last_contribution_date: string | null;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number | null;
  description: string | null;
  created_at: string;
}

interface ChartData {
  month: string;
  balance: number;
  interest: number;
}

const SavingsManagement = () => {
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      monthly_contribution: "" as any,
    },
  });

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      // Fetch savings account
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .maybeSingle();

      if (savingsError) throw savingsError;
      
      if (savingsData) {
        setSavingsAccount(savingsData);
        form.setValue('monthly_contribution', savingsData.monthly_contribution.toString() as any);
      }

      // Fetch transactions related to savings
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .in('transaction_type', ['savings_deposit', 'savings_withdrawal', 'interest_earned'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      
      if (txData) {
        setTransactions(txData);
        generateChartData(txData);
      }
    } catch (error) {
      console.error('Error fetching savings data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load savings data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (txData: Transaction[]) => {
    // Group transactions by month and calculate running totals
    const monthlyData: Record<string, { balance: number; interest: number }> = {};
    
    // Sort by date ascending for cumulative calculation
    const sortedTx = [...txData].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let cumulativeInterest = 0;
    
    sortedTx.forEach(tx => {
      const date = new Date(tx.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (tx.transaction_type === 'interest_earned') {
        cumulativeInterest += tx.amount;
      }
      
      monthlyData[monthKey] = {
        balance: tx.balance_after || 0,
        interest: cumulativeInterest,
      };
    });

    // Convert to array for chart
    const chartArray = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      balance: data.balance,
      interest: data.interest,
    }));

    // If no real data, generate sample data for visualization
    if (chartArray.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const sampleData = months.map((month, index) => ({
        month,
        balance: (index + 1) * 5000,
        interest: (index + 1) * 50,
      }));
      setChartData(sampleData);
    } else {
      setChartData(chartArray.slice(-6)); // Last 6 months
    }
  };

  const onSubmit = async (data: ContributionFormValues) => {
    if (!savingsAccount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Savings account not found.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newContribution = typeof data.monthly_contribution === 'string'
        ? parseFloat(data.monthly_contribution)
        : data.monthly_contribution;

      const { error } = await supabase
        .from('savings_accounts')
        .update({ monthly_contribution: newContribution })
        .eq('id', savingsAccount.id);

      if (error) throw error;

      setSavingsAccount(prev => prev ? { ...prev, monthly_contribution: newContribution } : null);
      setIsEditing(false);
      
      toast({
        title: "Contribution Updated",
        description: `Your monthly contribution has been set to ETB ${formatCurrency(newContribution)}.`,
      });
    } catch (error: any) {
      console.error('Error updating contribution:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update contribution amount.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      savings_deposit: 'Deposit',
      savings_withdrawal: 'Withdrawal',
      interest_earned: 'Interest Earned',
    };
    return labels[type] || type;
  };

  const isCredit = (type: string) => {
    return ['savings_deposit', 'interest_earned'].includes(type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading savings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logo} alt="Addis Mesob" className="h-10 w-10" />
            <span className="text-lg font-bold text-foreground">Addis Mesob</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Savings Management</h1>
          <p className="text-muted-foreground">
            View your savings balance, manage contributions, and track your interest earnings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <PiggyBank className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  +12.5%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-foreground">
                  ETB {formatCurrency(savingsAccount?.balance || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Monthly Contribution</p>
                <p className="text-2xl font-bold text-foreground">
                  ETB {formatCurrency(savingsAccount?.monthly_contribution || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 text-success text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  +5.2%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Interest Earned</p>
                <p className="text-2xl font-bold text-foreground">
                  ETB {formatCurrency(savingsAccount?.total_interest_earned || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-secondary text-secondary-foreground">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Last Contribution</p>
                <p className="text-2xl font-bold text-foreground">
                  {savingsAccount?.last_contribution_date 
                    ? formatDate(savingsAccount.last_contribution_date)
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Savings Growth
                </CardTitle>
                <CardDescription>
                  Your savings balance over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs fill-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs fill-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [`ETB ${formatCurrency(value)}`, 'Balance']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Interest Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-success" />
                  Interest Earnings
                </CardTitle>
                <CardDescription>
                  Cumulative interest earned over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-xs fill-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs fill-muted-foreground"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [`ETB ${formatCurrency(value)}`, 'Interest']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interest" 
                        stroke="hsl(var(--success))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Contribution Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    Monthly Contribution
                  </span>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Update your monthly savings contribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="monthly_contribution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Amount (ETB)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter new amount"
                                min="100"
                                max="50000"
                                step="50"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Min: ETB 100 | Max: ETB 50,000
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            form.setValue('monthly_contribution', savingsAccount?.monthly_contribution.toString() as any);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-foreground mb-2">
                      ETB {formatCurrency(savingsAccount?.monthly_contribution || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Automatically deducted each month
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Annual Rate</span>
                  <span className="font-semibold text-foreground">6.0% p.a.</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">This Year</span>
                  <span className="font-semibold text-success">
                    +ETB {formatCurrency((savingsAccount?.monthly_contribution || 0) * 6)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Projected (12mo)</span>
                  <span className="font-semibold text-foreground">
                    ETB {formatCurrency((savingsAccount?.balance || 0) + (savingsAccount?.monthly_contribution || 0) * 12 * 1.06)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Recent deposits, withdrawals, and interest earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No transactions yet. Your savings history will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              isCredit(tx.transaction_type) 
                                ? 'bg-success/10 text-success' 
                                : 'bg-accent/10 text-accent'
                            }`}>
                              {isCredit(tx.transaction_type) 
                                ? <ArrowDownRight className="h-4 w-4" />
                                : <ArrowUpRight className="h-4 w-4" />
                              }
                            </div>
                            <span className="font-medium">
                              {getTransactionLabel(tx.transaction_type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          isCredit(tx.transaction_type) ? 'text-success' : 'text-foreground'
                        }`}>
                          {isCredit(tx.transaction_type) ? '+' : '-'} ETB {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {tx.balance_after !== null ? `ETB ${formatCurrency(tx.balance_after)}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SavingsManagement;
