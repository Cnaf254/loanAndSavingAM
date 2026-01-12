import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Banknote,
  Calendar,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface LoanWithMember {
  id: string;
  loan_type: string;
  principal_amount: number;
  total_amount: number;
  interest_rate: number;
  term_months: number;
  monthly_payment: number;
  purpose: string | null;
  status: string;
  application_date: string;
  member_id: string;
  member?: {
    member_number: string;
    monthly_salary: number | null;
    employer: string | null;
  };
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  savings_balance?: number;
}

interface LoanApprovalRecord {
  id: string;
  approver_role: string;
  decision: string;
  remarks: string | null;
  created_at: string;
}

const LoanApproval = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loans, setLoans] = useState<LoanWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending_approval");
  const [selectedLoan, setSelectedLoan] = useState<LoanWithMember | null>(null);
  const [loanApprovals, setLoanApprovals] = useState<LoanApprovalRecord[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { profile, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      // Build query - we need to handle the status filter carefully
      const { data: loansData, error: loansError } = statusFilter === "all"
        ? await supabase
            .from('loans')
            .select('*')
            .order('application_date', { ascending: false })
        : await supabase
            .from('loans')
            .select('*')
            .eq('status', statusFilter as "draft" | "pending_approval" | "approved" | "rejected" | "disbursed" | "repaying" | "completed" | "defaulted")
            .order('application_date', { ascending: false });

      if (loansError) throw loansError;

      if (loansData && loansData.length > 0) {
        const memberIds = [...new Set(loansData.map(l => l.member_id))];
        
        const { data: membersData } = await supabase
          .from('members')
          .select('id, user_id, member_number, monthly_salary, employer')
          .in('id', memberIds);

        const userIds = membersData?.map(m => m.user_id) || [];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone')
          .in('id', userIds);

        const { data: savingsData } = await supabase
          .from('savings_accounts')
          .select('member_id, balance')
          .in('member_id', memberIds);

        const membersMap = new Map(membersData?.map(m => [m.id, m]) || []);
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const savingsMap = new Map(savingsData?.map(s => [s.member_id, s.balance]) || []);

        const loansWithDetails = loansData.map(loan => {
          const member = membersMap.get(loan.member_id);
          const profile = member ? profilesMap.get(member.user_id) : null;
          return {
            ...loan,
            member: member || undefined,
            profile: profile || undefined,
            savings_balance: savingsMap.get(loan.member_id) || 0,
          };
        }) as LoanWithMember[];

        setLoans(loansWithDetails);
      } else {
        setLoans([]);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load loans.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanApprovals = async (loanId: string) => {
    const { data, error } = await supabase
      .from('loan_approvals')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setLoanApprovals(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openViewDialog = async (loan: LoanWithMember) => {
    setSelectedLoan(loan);
    await fetchLoanApprovals(loan.id);
    setIsViewDialogOpen(true);
  };

  const openActionDialog = (loan: LoanWithMember, type: "approve" | "reject") => {
    setSelectedLoan(loan);
    setActionType(type);
    setRemarks("");
    setIsActionDialogOpen(true);
  };

  const handleApproval = async () => {
    if (!selectedLoan) return;
    
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const approverRole = roles[0] || 'member';
      const decision = actionType === "approve" ? "approved" : "rejected";

      // Insert approval record
      const { error: approvalError } = await supabase
        .from('loan_approvals')
        .insert({
          loan_id: selectedLoan.id,
          approver_id: user.id,
          approver_role: approverRole,
          decision: decision,
          remarks: remarks || null,
        });

      if (approvalError) throw approvalError;

      // Update loan status based on decision
      const newStatus = actionType === "approve" ? "approved" : "rejected";
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (actionType === "approve") {
        updateData.approval_date = new Date().toISOString();
      }

      const { error: loanError } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', selectedLoan.id);

      if (loanError) throw loanError;

      toast({
        title: actionType === "approve" ? "Loan Approved" : "Loan Rejected",
        description: `Loan application has been ${decision}.`,
      });

      setIsActionDialogOpen(false);
      fetchLoans();
    } catch (error: any) {
      console.error('Error processing loan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process loan.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const navigation = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Members", icon: Users, href: "/admin" },
    { name: "Loan Approvals", icon: Wallet, href: "/admin/loans", active: true },
    { name: "Reports", icon: FileText, href: "/admin" },
    { name: "Settings", icon: Settings, href: "/admin" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getLoanTypeBadge = (type: string) => {
    const config: Record<string, { className: string; label: string }> = {
      short_term: { className: "bg-blue-100 text-blue-800", label: "Short Term" },
      long_term: { className: "bg-purple-100 text-purple-800", label: "Long Term" },
      holiday: { className: "bg-orange-100 text-orange-800", label: "Holiday" },
    };
    const c = config[type] || { className: "bg-gray-100 text-gray-800", label: type };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      pending_approval: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      disbursed: { variant: "default", label: "Disbursed" },
      repaying: { variant: "default", label: "Repaying" },
      completed: { variant: "outline", label: "Completed" },
      defaulted: { variant: "destructive", label: "Defaulted" },
    };
    const c = config[status] || { variant: "outline", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Staff';
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : 'S';
  const userRole = roles.length > 0 ? getRoleBadge(roles[0]) : 'Staff';

  const pendingCount = loans.filter(l => l.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Addis Mesob" className="h-10 w-10" />
              <div>
                <span className="text-lg font-bold text-sidebar-foreground">Addis Mesob</span>
                <span className="block text-[9px] text-sidebar-foreground/60 uppercase tracking-widest">
                  Loan Approvals
                </span>
              </div>
            </Link>
          </div>

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

          <div className="p-4 border-t border-sidebar-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent mb-2"
              asChild
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span>Member Portal</span>
              </Link>
            </Button>
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

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Loan Approvals</h1>
                  <p className="text-sm text-muted-foreground">Review and manage loan applications</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold">{loans.filter(l => l.status === 'pending_approval').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-100 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{loans.filter(l => l.status === 'approved').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-100 text-red-700">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold">{loans.filter(l => l.status === 'rejected').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loans Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Loan Applications</CardTitle>
                  <CardDescription>Review and process loan requests</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Loans</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
                    <SelectItem value="repaying">Repaying</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No loan applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {loan.profile?.first_name} {loan.profile?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {loan.member?.member_number}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getLoanTypeBadge(loan.loan_type)}</TableCell>
                          <TableCell>ETB {formatCurrency(loan.principal_amount)}</TableCell>
                          <TableCell>{loan.term_months} months</TableCell>
                          <TableCell>{formatDate(loan.application_date)}</TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openViewDialog(loan)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {loan.status === 'pending_approval' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => openActionDialog(loan, "approve")}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openActionDialog(loan, "reject")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
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

      {/* View Loan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Application Details</DialogTitle>
            <DialogDescription>
              Review the complete loan application
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Applicant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">
                        {selectedLoan.profile?.first_name} {selectedLoan.profile?.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member #</span>
                      <span>{selectedLoan.member?.member_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{selectedLoan.profile?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Employer</span>
                      <span>{selectedLoan.member?.employer || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Salary</span>
                      <span>ETB {formatCurrency(selectedLoan.member?.monthly_salary || 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Savings Balance</span>
                      <span className="font-medium text-green-600">
                        ETB {formatCurrency(selectedLoan.savings_balance || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Eligibility</span>
                      <span>
                        ETB {formatCurrency((selectedLoan.savings_balance || 0) * 3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested Amount</span>
                      <span className="font-medium">
                        ETB {formatCurrency(selectedLoan.principal_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Debt-to-Income</span>
                      <span>
                        {selectedLoan.member?.monthly_salary 
                          ? ((selectedLoan.monthly_payment / selectedLoan.member.monthly_salary) * 100).toFixed(1)
                          : 'N/A'}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Loan Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Loan Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Type</span>
                      {getLoanTypeBadge(selectedLoan.loan_type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(selectedLoan.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Principal</span>
                      <span>ETB {formatCurrency(selectedLoan.principal_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span>{selectedLoan.interest_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Term</span>
                      <span>{selectedLoan.term_months} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Payment</span>
                      <span>ETB {formatCurrency(selectedLoan.monthly_payment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Repayment</span>
                      <span className="font-medium">ETB {formatCurrency(selectedLoan.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Application Date</span>
                      <span>{formatDate(selectedLoan.application_date)}</span>
                    </div>
                  </div>
                  {selectedLoan.purpose && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                      <p className="text-sm">{selectedLoan.purpose}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval History */}
              {loanApprovals.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Approval History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {loanApprovals.map((approval) => (
                        <div 
                          key={approval.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          {approval.decision === 'approved' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {getRoleBadge(approval.approver_role)}
                              </span>
                              <Badge variant={approval.decision === 'approved' ? 'default' : 'destructive'} className="text-xs">
                                {approval.decision}
                              </Badge>
                            </div>
                            {approval.remarks && (
                              <p className="text-sm text-muted-foreground mt-1">{approval.remarks}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(approval.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedLoan?.status === 'pending_approval' && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openActionDialog(selectedLoan, "reject");
                  }}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openActionDialog(selectedLoan, "approve");
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Loan" : "Reject Loan"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "Confirm approval of this loan application."
                : "Provide a reason for rejecting this loan application."
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Applicant</span>
                  <span className="font-medium">
                    {selectedLoan.profile?.first_name} {selectedLoan.profile?.last_name}
                  </span>
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">ETB {formatCurrency(selectedLoan.principal_amount)}</span>
                  <span className="text-muted-foreground">Type</span>
                  <span>{getLoanTypeBadge(selectedLoan.loan_type)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Remarks {actionType === "reject" && <span className="text-destructive">*</span>}
                </label>
                <Textarea
                  placeholder={actionType === "approve" 
                    ? "Add any notes (optional)..."
                    : "Provide reason for rejection..."
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleApproval}
              disabled={isProcessing || (actionType === "reject" && !remarks.trim())}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanApproval;
