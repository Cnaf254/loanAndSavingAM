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
  Bell,
  Search,
  Menu,
  UserCheck,
  UserX,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Loader2,
  Filter,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface Member {
  id: string;
  member_number: string;
  user_id: string;
  status: string;
  employer: string | null;
  employee_id: string | null;
  department: string | null;
  monthly_salary: number | null;
  bank_name: string | null;
  bank_account: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  } | null;
}

interface Stats {
  totalMembers: number;
  pendingMembers: number;
  activeMembers: number;
  totalLoans: number;
}

const AdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, pendingMembers: 0, activeMembers: 0, totalLoans: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { profile, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;
      
      if (membersData) {
        // Fetch profiles for all members
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, phone')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Create a map of profiles by user_id
        const profilesMap = new Map(
          profilesData?.map(p => [p.id, p]) || []
        );

        // Merge profiles into members
        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profiles: profilesMap.get(member.user_id) || null,
        })) as Member[];
        
        setMembers(membersWithProfiles);
        
        // Calculate stats
        const total = membersData.length;
        const pending = membersData.filter(m => m.status === 'pending').length;
        const active = membersData.filter(m => m.status === 'active').length;
        
        // Fetch loan count
        const { count: loanCount } = await supabase
          .from('loans')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalMembers: total,
          pendingMembers: pending,
          activeMembers: active,
          totalLoans: loanCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data.",
      });
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

  const handleApprove = async () => {
    if (!selectedMember) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          status: 'active',
          approved_at: new Date().toISOString(),
        })
        .eq('id', selectedMember.id);

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === selectedMember.id ? { ...m, status: 'active' } : m
      ));
      
      setStats(prev => ({
        ...prev,
        pendingMembers: prev.pendingMembers - 1,
        activeMembers: prev.activeMembers + 1,
      }));

      toast({
        title: "Member Approved",
        description: `${selectedMember.profiles?.first_name} ${selectedMember.profiles?.last_name} has been approved.`,
      });

      setIsActionDialogOpen(false);
      setActionReason("");
    } catch (error: any) {
      console.error('Error approving member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve member.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMember) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: 'inactive' })
        .eq('id', selectedMember.id);

      if (error) throw error;

      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === selectedMember.id ? { ...m, status: 'inactive' } : m
      ));
      
      setStats(prev => ({
        ...prev,
        pendingMembers: prev.pendingMembers - 1,
      }));

      toast({
        title: "Member Rejected",
        description: `${selectedMember.profiles?.first_name} ${selectedMember.profiles?.last_name} has been rejected.`,
      });

      setIsActionDialogOpen(false);
      setActionReason("");
    } catch (error: any) {
      console.error('Error rejecting member:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject member.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openActionDialog = (member: Member, type: "approve" | "reject") => {
    setSelectedMember(member);
    setActionType(type);
    setIsActionDialogOpen(true);
  };

  const openViewDialog = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const navigation = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin", active: true },
    { name: "Members", icon: Users, href: "/admin/members", active: false },
    { name: "Loans", icon: Wallet, href: "/admin/loans", active: false },
    { name: "Reports", icon: FileText, href: "/admin/reports", active: false },
    { name: "Settings", icon: Settings, href: "/admin/settings", active: false },
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      active: { variant: "default", label: "Active" },
      suspended: { variant: "destructive", label: "Suspended" },
      inactive: { variant: "outline", label: "Inactive" },
    };
    const config = statusConfig[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.member_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Admin';
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : 'A';
  const userRole = roles.length > 0 ? getRoleBadge(roles[0]) : 'Staff';

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
                  Admin Portal
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

          {/* Switch to Member Portal */}
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
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{userRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {stats.pendingMembers > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {stats.pendingMembers}
                  </span>
                )}
              </button>

              {/* Profile */}
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
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-warning/10 text-warning">
                        <Clock className="h-6 w-6" />
                      </div>
                      {stats.pendingMembers > 0 && (
                        <Badge variant="secondary">{stats.pendingMembers} pending</Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Pending Approval</p>
                      <p className="text-2xl font-bold text-foreground">{stats.pendingMembers}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-success/10 text-success">
                        <UserCheck className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Active Members</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeMembers}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-accent/10 text-accent">
                        <Wallet className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Total Loans</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalLoans}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Members Table */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Member Management
                      </CardTitle>
                      <CardDescription>
                        View, approve, and manage member applications
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-full sm:w-64"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No members found matching your criteria.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Member #</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {member.profiles?.first_name?.[0]}{member.profiles?.last_name?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {member.profiles?.first_name} {member.profiles?.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {member.employer || 'No employer'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {member.member_number}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm">{member.profiles?.email}</p>
                                  <p className="text-sm text-muted-foreground">{member.profiles?.phone || '-'}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(member.status)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(member.created_at)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openViewDialog(member)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {member.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-success hover:text-success"
                                        onClick={() => openActionDialog(member, 'approve')}
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => openActionDialog(member, 'reject')}
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
            </>
          )}
        </main>
      </div>

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              View complete member information
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-6">
              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedMember.profiles?.first_name} {selectedMember.profiles?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Number</p>
                  <p className="font-mono">{selectedMember.member_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedMember.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{selectedMember.profiles?.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedMember.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p>{selectedMember.gender || '-'}</p>
                </div>
              </div>

              {/* Employment Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Employment Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employer</p>
                    <p>{selectedMember.employer || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p>{selectedMember.employee_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p>{selectedMember.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Salary</p>
                    <p>{selectedMember.monthly_salary ? `ETB ${formatCurrency(selectedMember.monthly_salary)}` : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Bank Information</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p>{selectedMember.bank_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p>{selectedMember.bank_account || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Address</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p>{selectedMember.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p>{selectedMember.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p>{selectedMember.region || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Member' : 'Reject Member'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Are you sure you want to approve ${selectedMember?.profiles?.first_name} ${selectedMember?.profiles?.last_name}?`
                : `Are you sure you want to reject ${selectedMember?.profiles?.first_name} ${selectedMember?.profiles?.last_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' && (
            <div className="py-4">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-2"
              />
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
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
