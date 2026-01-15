import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  UserCog,
  ClipboardList,
  Database,
  Bell,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  dummyMembers,
  dummyAuditLogs,
  dashboardStats,
  formatCurrency,
  formatDate,
} from '@/data/dummyData';

const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@addismesob.com',
  role: 'admin',
  avatarUrl: null,
};

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, href: '/admin' },
  { name: 'Members', icon: Users, href: '/admin/members' },
  { name: 'User Management', icon: UserCog, href: '/admin/users' },
  { name: 'Role Management', icon: Shield, href: '/admin/roles' },
  { name: 'Audit Logs', icon: ClipboardList, href: '/admin/audit' },
  { name: 'Reports', icon: FileText, href: '/admin/reports' },
  { name: 'System Settings', icon: Settings, href: '/admin/settings' },
  { name: 'Database', icon: Database, href: '/admin/database' },
];

const switchPortals = [
  { name: 'Member Portal', href: '/member', icon: Users },
];

const SystemAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const stats = dashboardStats.admin;

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-blue-600' },
    { title: 'Active Members', value: stats.activeMembers, icon: Users, color: 'text-green-600' },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Bell, color: 'text-yellow-600' },
    { title: 'Total Savings', value: formatCurrency(stats.totalSavings), icon: Database, color: 'text-primary' },
    { title: 'Active Loans', value: stats.totalLoansActive, icon: FileText, color: 'text-purple-600' },
    { title: 'Loan Portfolio', value: formatCurrency(stats.totalLoanAmount), icon: Database, color: 'text-orange-600' },
    { title: 'System Users', value: stats.systemUsers, icon: UserCog, color: 'text-indigo-600' },
    { title: 'Audit Logs Today', value: stats.auditLogsToday, icon: ClipboardList, color: 'text-gray-600' },
  ];

  const filteredMembers = dummyMembers.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      suspended: 'destructive',
      inactive: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <DashboardLayout
      navigation={navigation}
      portalName="Addis Mesob"
      portalSubtitle="System Admin"
      user={adminUser}
      switchPortals={switchPortals}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Administration</h1>
            <p className="text-muted-foreground">Manage users, roles, and system configuration</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="users">System Users</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent System Activities</CardTitle>
                  <CardDescription>Latest actions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dummyAuditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            by {log.performedBy} ({log.role}) • {log.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status</span>
                      <Badge variant="default" className="bg-green-600">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Services</span>
                      <Badge variant="default" className="bg-green-600">Running</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bank Integration</span>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SMS Gateway</span>
                      <Badge variant="secondary">Limited</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>All Members</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.memberNumber}</TableCell>
                        <TableCell>{member.firstName} {member.lastName}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>{formatCurrency(member.savingsBalance)}</TableCell>
                        <TableCell>{formatDate(member.joinDate)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Suspend
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Users & Roles</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>System Admin</TableCell>
                      <TableCell>admin@addismesob.com</TableCell>
                      <TableCell><Badge>Admin</Badge></TableCell>
                      <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                      <TableCell>Today, 08:00</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fikadu Tadesse</TableCell>
                      <TableCell>fikadu@addismesob.com</TableCell>
                      <TableCell><Badge className="bg-purple-600">Chairperson</Badge></TableCell>
                      <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                      <TableCell>Today, 10:15</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Hana Girma</TableCell>
                      <TableCell>hana@addismesob.com</TableCell>
                      <TableCell><Badge className="bg-yellow-600">Accountant</Badge></TableCell>
                      <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                      <TableCell>Today, 11:30</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kebede Alemu</TableCell>
                      <TableCell>kebede@addismesob.com</TableCell>
                      <TableCell><Badge className="bg-blue-600">Loan Committee</Badge></TableCell>
                      <TableCell><Badge variant="default" className="bg-green-600">Active</Badge></TableCell>
                      <TableCell>Yesterday</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Complete system activity log</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.performedBy}</TableCell>
                        <TableCell><Badge variant="outline">{log.role}</Badge></TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.details}</TableCell>
                        <TableCell className="text-muted-foreground">{log.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SystemAdminDashboard;
