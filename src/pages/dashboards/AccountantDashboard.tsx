import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  PiggyBank,
  CreditCard,
  Download,
  Users,
  Shield,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dummyTransactions, dummySavingsAccounts, dummyLoans, dashboardStats, formatCurrency, formatDate } from '@/data/dummyData';

const accountantUser = { firstName: 'Hana', lastName: 'Girma', email: 'hana@addismesob.com', role: 'accountant', avatarUrl: null };

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, href: '/accountant' },
  { name: 'Savings', icon: PiggyBank, href: '/accountant/savings' },
  { name: 'Loans', icon: Wallet, href: '/accountant/loans' },
  { name: 'Transactions', icon: CreditCard, href: '/accountant/transactions' },
  { name: 'Disbursements', icon: DollarSign, href: '/accountant/disbursements' },
  { name: 'Reports', icon: FileText, href: '/accountant/reports' },
];

const switchPortals = [
  { name: 'Member Portal', href: '/member', icon: Users },
  { name: 'Admin Portal', href: '/admin', icon: Shield },
];

const AccountantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const stats = dashboardStats.accountant;

  const statCards = [
    { title: 'Total Savings', value: formatCurrency(stats.totalSavings), icon: PiggyBank, color: 'text-green-600' },
    { title: 'Monthly Collections', value: formatCurrency(stats.monthlyCollections), icon: ArrowDownLeft, color: 'text-blue-600' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-yellow-600' },
    { title: 'Disbursements (Month)', value: formatCurrency(stats.totalDisbursementsMonth), icon: ArrowUpRight, color: 'text-purple-600' },
  ];

  const pendingDisbursements = dummyLoans.filter(l => l.status === 'approved');

  return (
    <DashboardLayout navigation={navigation} portalName="Addis Mesob" portalSubtitle="Accountant" user={accountantUser} switchPortals={switchPortals}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Accountant Dashboard</h1>
            <p className="text-muted-foreground">Manage finances, process payments, and generate reports</p>
          </div>
          <Button><Download className="h-4 w-4 mr-2" />Export Report</Button>
        </div>

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="disbursements">Pending Disbursements {pendingDisbursements.length > 0 && <Badge variant="destructive" className="ml-2">{pendingDisbursements.length}</Badge>}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle>Savings Summary</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Balance</TableHead><TableHead>Monthly</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {dummySavingsAccounts.slice(0,4).map(s => (
                        <TableRow key={s.id}><TableCell>{s.memberName}</TableCell><TableCell>{formatCurrency(s.balance)}</TableCell><TableCell>{formatCurrency(s.monthlyContribution)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Process Salary Deductions</Button>
                  <Button className="w-full justify-start" variant="outline"><DollarSign className="h-4 w-4 mr-2" />Record Manual Payment</Button>
                  <Button className="w-full justify-start" variant="outline"><FileText className="h-4 w-4 mr-2" />Generate Monthly Report</Button>
                  <Button className="w-full justify-start" variant="outline"><Download className="h-4 w-4 mr-2" />Export to Excel</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Member</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Balance After</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {dummyTransactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell>{t.memberName}</TableCell>
                        <TableCell><Badge variant="outline">{t.type.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className={t.type.includes('deposit') || t.type.includes('repayment') ? 'text-green-600' : 'text-red-600'}>{t.type.includes('deposit') || t.type.includes('repayment') ? '+' : '-'}{formatCurrency(t.amount)}</TableCell>
                        <TableCell>{formatCurrency(t.balanceAfter)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disbursements">
            <Card>
              <CardHeader><CardTitle>Loans Approved - Awaiting Disbursement</CardTitle></CardHeader>
              <CardContent>
                {pendingDisbursements.length === 0 ? (
                  <div className="text-center py-8"><CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" /><p>No pending disbursements</p></div>
                ) : (
                  <div className="space-y-4">
                    {pendingDisbursements.map(loan => (
                      <div key={loan.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div><p className="font-medium">{loan.memberName}</p><p className="text-sm text-muted-foreground">{formatCurrency(loan.principalAmount)} - {loan.loanType.replace('_',' ')}</p></div>
                        <Button className="bg-green-600 hover:bg-green-700"><DollarSign className="h-4 w-4 mr-2" />Process Disbursement</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AccountantDashboard;
