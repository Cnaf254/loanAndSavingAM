import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  PiggyBank, 
  Wallet, 
  FileText, 
  Users, 
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
  User,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface GuarantorRequest {
  id: string;
  loan_id: string;
  guarantor_member_id: string;
  guaranteed_amount: number;
  status: string;
  created_at: string;
  accepted_at: string | null;
  loan?: {
    id: string;
    loan_type: string;
    principal_amount: number;
    total_amount: number;
    term_months: number;
    purpose: string | null;
    status: string;
  };
  applicant?: {
    first_name: string;
    last_name: string;
    member_number: string;
  };
}

const GuarantorManagement = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<GuarantorRequest[]>([]);
  const [respondedRequests, setRespondedRequests] = useState<GuarantorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<GuarantorRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "decline">("accept");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { profile, signOut, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGuarantorRequests();
  }, []);

  const fetchGuarantorRequests = async () => {
    setLoading(true);
    try {
      // Fetch all guarantor requests for current user
      const { data: guarantorData, error: guarantorError } = await supabase
        .from('guarantors')
        .select('*')
        .order('created_at', { ascending: false });

      if (guarantorError) throw guarantorError;

      if (guarantorData && guarantorData.length > 0) {
        // Get unique loan IDs
        const loanIds = [...new Set(guarantorData.map(g => g.loan_id))];
        
        // Fetch loans
        const { data: loansData } = await supabase
          .from('loans')
          .select('id, loan_type, principal_amount, total_amount, term_months, purpose, status, member_id')
          .in('id', loanIds);

        // Get member IDs from loans to fetch applicant info
        const memberIds = loansData?.map(l => l.member_id) || [];
        
        // Fetch members for applicant info
        const { data: membersData } = await supabase
          .from('members')
          .select('id, user_id, member_number')
          .in('id', memberIds);

        const userIds = membersData?.map(m => m.user_id) || [];
        
        // Fetch profiles for applicant names
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const loansMap = new Map(loansData?.map(l => [l.id, l]) || []);
        const membersMap = new Map(membersData?.map(m => [m.id, m]) || []);
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const requestsWithDetails = guarantorData.map(g => {
          const loan = loansMap.get(g.loan_id);
          const member = loan ? membersMap.get(loan.member_id) : null;
          const applicantProfile = member ? profilesMap.get(member.user_id) : null;
          
          return {
            ...g,
            loan: loan ? {
              id: loan.id,
              loan_type: loan.loan_type,
              principal_amount: loan.principal_amount,
              total_amount: loan.total_amount,
              term_months: loan.term_months,
              purpose: loan.purpose,
              status: loan.status,
            } : undefined,
            applicant: applicantProfile && member ? {
              first_name: applicantProfile.first_name,
              last_name: applicantProfile.last_name,
              member_number: member.member_number,
            } : undefined,
          };
        }) as GuarantorRequest[];

        setPendingRequests(requestsWithDetails.filter(r => r.status === 'pending'));
        setRespondedRequests(requestsWithDetails.filter(r => r.status !== 'pending'));
      } else {
        setPendingRequests([]);
        setRespondedRequests([]);
      }
    } catch (error) {
      console.error('Error fetching guarantor requests:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load guarantor requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openViewDialog = (request: GuarantorRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const openActionDialog = (request: GuarantorRequest, type: "accept" | "decline") => {
    setSelectedRequest(request);
    setActionType(type);
    setIsActionDialogOpen(true);
  };

  const handleResponse = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      const newStatus = actionType === "accept" ? "accepted" : "declined";
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (actionType === "accept") {
        updateData.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('guarantors')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: actionType === "accept" ? "Request Accepted" : "Request Declined",
        description: `You have ${newStatus} the guarantor request.`,
      });

      setIsActionDialogOpen(false);
      fetchGuarantorRequests();
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process request.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Savings", icon: PiggyBank, href: "/dashboard/savings" },
    { name: "Loans", icon: Wallet, href: "/dashboard/loans" },
    { name: "Statements", icon: FileText, href: "/dashboard/statements" },
    { name: "Guarantors", icon: Users, href: "/dashboard/guarantors", active: true },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
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
      pending: { variant: "secondary", label: "Pending" },
      accepted: { variant: "default", label: "Accepted" },
      declined: { variant: "destructive", label: "Declined" },
    };
    const c = config[status] || { variant: "outline", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Member';
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : 'M';

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
                  Member Portal
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
                  <Link to="/dashboard">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Guarantor Requests</h1>
                  <p className="text-sm text-muted-foreground">Manage your guarantor obligations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{userName}</p>
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
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold">{pendingRequests.length}</p>
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
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <p className="text-2xl font-bold">{respondedRequests.filter(r => r.status === 'accepted').length}</p>
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
                    <p className="text-sm text-muted-foreground">Declined</p>
                    <p className="text-2xl font-bold">{respondedRequests.filter(r => r.status === 'declined').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Notice */}
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    By accepting a guarantor request, you agree to cover the guaranteed amount if the loan applicant defaults on their repayment. Please review each request carefully before accepting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="responded" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Responded ({respondedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                  <CardDescription>Guarantor requests awaiting your response</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending guarantor requests</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Loan Type</TableHead>
                            <TableHead>Loan Amount</TableHead>
                            <TableHead>Your Guarantee</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {request.applicant 
                                      ? `${request.applicant.first_name} ${request.applicant.last_name}`
                                      : 'Unknown'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.applicant?.member_number || '-'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.loan ? getLoanTypeBadge(request.loan.loan_type) : '-'}
                              </TableCell>
                              <TableCell>
                                ETB {request.loan ? formatCurrency(request.loan.total_amount) : '-'}
                              </TableCell>
                              <TableCell className="font-medium text-primary">
                                ETB {formatCurrency(request.guaranteed_amount)}
                              </TableCell>
                              <TableCell>{formatDate(request.created_at)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openViewDialog(request)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => openActionDialog(request, "accept")}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openActionDialog(request, "decline")}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
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
            </TabsContent>

            <TabsContent value="responded">
              <Card>
                <CardHeader>
                  <CardTitle>Responded Requests</CardTitle>
                  <CardDescription>Your previous guarantor decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : respondedRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No responded requests yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Loan Type</TableHead>
                            <TableHead>Loan Amount</TableHead>
                            <TableHead>Your Guarantee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {respondedRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {request.applicant 
                                      ? `${request.applicant.first_name} ${request.applicant.last_name}`
                                      : 'Unknown'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.applicant?.member_number || '-'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {request.loan ? getLoanTypeBadge(request.loan.loan_type) : '-'}
                              </TableCell>
                              <TableCell>
                                ETB {request.loan ? formatCurrency(request.loan.total_amount) : '-'}
                              </TableCell>
                              <TableCell className="font-medium">
                                ETB {formatCurrency(request.guaranteed_amount)}
                              </TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell>
                                {request.accepted_at 
                                  ? formatDate(request.accepted_at) 
                                  : formatDate(request.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openViewDialog(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Guarantor Request Details</DialogTitle>
            <DialogDescription>
              Review the loan details before responding
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">
                    {selectedRequest.applicant 
                      ? `${selectedRequest.applicant.first_name} ${selectedRequest.applicant.last_name}`
                      : 'Unknown Applicant'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Member #{selectedRequest.applicant?.member_number || '-'}
                  </p>
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Loan Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Type</p>
                    <div className="mt-1">
                      {selectedRequest.loan ? getLoanTypeBadge(selectedRequest.loan.loan_type) : '-'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Status</p>
                    <p className="font-medium capitalize mt-1">
                      {selectedRequest.loan?.status.replace('_', ' ') || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Principal Amount</p>
                    <p className="font-medium mt-1">
                      ETB {selectedRequest.loan ? formatCurrency(selectedRequest.loan.principal_amount) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-medium mt-1">
                      ETB {selectedRequest.loan ? formatCurrency(selectedRequest.loan.total_amount) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Term</p>
                    <p className="font-medium mt-1">
                      {selectedRequest.loan?.term_months || '-'} months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purpose</p>
                    <p className="font-medium mt-1">
                      {selectedRequest.loan?.purpose || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Guarantee */}
              <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-primary">Your Guarantee Amount</p>
                </div>
                <p className="text-2xl font-bold">
                  ETB {formatCurrency(selectedRequest.guaranteed_amount)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You will be responsible for this amount if the applicant defaults
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Request Status</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openActionDialog(selectedRequest, "decline");
                  }}
                >
                  Decline
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openActionDialog(selectedRequest, "accept");
                  }}
                >
                  Accept
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
              {actionType === "accept" ? "Accept Guarantor Request" : "Decline Guarantor Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "accept" 
                ? "Are you sure you want to accept this guarantor request? By accepting, you agree to cover the guaranteed amount if the loan applicant defaults."
                : "Are you sure you want to decline this guarantor request? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Guarantee Amount</span>
                <span className="font-bold text-lg">
                  ETB {formatCurrency(selectedRequest.guaranteed_amount)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "accept" ? "default" : "destructive"}
              onClick={handleResponse}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === "accept" ? "Accept Request" : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuarantorManagement;
