// Dummy data for frontend development

export interface DummyMember {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  joinDate: string;
  employer: string;
  department: string;
  monthlySalary: number;
  savingsBalance: number;
}

export interface DummyLoan {
  id: string;
  memberNumber: string;
  memberName: string;
  loanType: 'short_term' | 'long_term' | 'holiday';
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  remainingBalance: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'disbursed' | 'repaying' | 'completed' | 'defaulted';
  applicationDate: string;
  approvalStage: 'chairperson' | 'accountant' | 'loan_committee' | 'management_committee' | 'completed';
  guarantors: { name: string; amount: number; status: 'pending' | 'accepted' | 'rejected' }[];
  purpose: string;
}

export interface DummyTransaction {
  id: string;
  memberNumber: string;
  memberName: string;
  type: 'savings_deposit' | 'savings_withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'interest_earned' | 'fee';
  amount: number;
  balanceAfter: number;
  date: string;
  description: string;
  processedBy?: string;
}

export interface DummySavingsAccount {
  id: string;
  memberNumber: string;
  memberName: string;
  balance: number;
  monthlyContribution: number;
  totalInterestEarned: number;
  lastContributionDate: string;
}

export interface DummyApproval {
  id: string;
  type: 'membership' | 'loan' | 'savings_change';
  applicantName: string;
  memberNumber: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  details: string;
  amount?: number;
}

export interface DummyAuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

// Current user simulation (change role to test different dashboards)
export const currentUser = {
  id: 'user-1',
  firstName: 'Abebe',
  lastName: 'Kebede',
  email: 'abebe@addismesob.com',
  role: 'member' as 'admin' | 'chairperson' | 'loan_committee' | 'management_committee' | 'accountant' | 'member',
  memberNumber: 'AM-2024-001',
  avatarUrl: null,
};

// Dummy members data
export const dummyMembers: DummyMember[] = [
  {
    id: '1',
    memberNumber: 'AM-2024-001',
    firstName: 'Abebe',
    lastName: 'Kebede',
    email: 'abebe@example.com',
    phone: '+251911234567',
    status: 'active',
    joinDate: '2024-01-15',
    employer: 'Ethiopian Airlines',
    department: 'Engineering',
    monthlySalary: 45000,
    savingsBalance: 125000,
  },
  {
    id: '2',
    memberNumber: 'AM-2024-002',
    firstName: 'Tigist',
    lastName: 'Hailu',
    email: 'tigist@example.com',
    phone: '+251922345678',
    status: 'active',
    joinDate: '2024-02-20',
    employer: 'Commercial Bank of Ethiopia',
    department: 'Finance',
    monthlySalary: 38000,
    savingsBalance: 89000,
  },
  {
    id: '3',
    memberNumber: 'AM-2024-003',
    firstName: 'Dawit',
    lastName: 'Tesfaye',
    email: 'dawit@example.com',
    phone: '+251933456789',
    status: 'pending',
    joinDate: '2024-12-01',
    employer: 'Ethio Telecom',
    department: 'IT',
    monthlySalary: 52000,
    savingsBalance: 0,
  },
  {
    id: '4',
    memberNumber: 'AM-2024-004',
    firstName: 'Meron',
    lastName: 'Alemu',
    email: 'meron@example.com',
    phone: '+251944567890',
    status: 'active',
    joinDate: '2024-03-10',
    employer: 'Ministry of Health',
    department: 'Administration',
    monthlySalary: 32000,
    savingsBalance: 67000,
  },
  {
    id: '5',
    memberNumber: 'AM-2024-005',
    firstName: 'Solomon',
    lastName: 'Bekele',
    email: 'solomon@example.com',
    phone: '+251955678901',
    status: 'suspended',
    joinDate: '2023-11-05',
    employer: 'Ethiopian Electric Power',
    department: 'Operations',
    monthlySalary: 41000,
    savingsBalance: 156000,
  },
];

// Dummy loans data
export const dummyLoans: DummyLoan[] = [
  {
    id: 'loan-1',
    memberNumber: 'AM-2024-001',
    memberName: 'Abebe Kebede',
    loanType: 'short_term',
    principalAmount: 50000,
    interestRate: 8,
    termMonths: 12,
    monthlyPayment: 4333,
    totalAmount: 54000,
    remainingBalance: 38000,
    status: 'repaying',
    applicationDate: '2024-06-15',
    approvalStage: 'completed',
    guarantors: [
      { name: 'Tigist Hailu', amount: 25000, status: 'accepted' },
      { name: 'Meron Alemu', amount: 25000, status: 'accepted' },
    ],
    purpose: 'Home renovation',
  },
  {
    id: 'loan-2',
    memberNumber: 'AM-2024-002',
    memberName: 'Tigist Hailu',
    loanType: 'long_term',
    principalAmount: 200000,
    interestRate: 10,
    termMonths: 36,
    monthlyPayment: 6450,
    totalAmount: 232200,
    remainingBalance: 200000,
    status: 'pending_approval',
    applicationDate: '2024-12-10',
    approvalStage: 'loan_committee',
    guarantors: [
      { name: 'Abebe Kebede', amount: 100000, status: 'accepted' },
      { name: 'Solomon Bekele', amount: 100000, status: 'pending' },
    ],
    purpose: 'Vehicle purchase',
  },
  {
    id: 'loan-3',
    memberNumber: 'AM-2024-004',
    memberName: 'Meron Alemu',
    loanType: 'holiday',
    principalAmount: 15000,
    interestRate: 6,
    termMonths: 6,
    monthlyPayment: 2575,
    totalAmount: 15450,
    remainingBalance: 15000,
    status: 'pending_approval',
    applicationDate: '2024-12-20',
    approvalStage: 'chairperson',
    guarantors: [
      { name: 'Tigist Hailu', amount: 15000, status: 'pending' },
    ],
    purpose: 'Holiday travel',
  },
  {
    id: 'loan-4',
    memberNumber: 'AM-2024-005',
    memberName: 'Solomon Bekele',
    loanType: 'short_term',
    principalAmount: 80000,
    interestRate: 8,
    termMonths: 18,
    monthlyPayment: 4800,
    totalAmount: 86400,
    remainingBalance: 0,
    status: 'completed',
    applicationDate: '2023-06-01',
    approvalStage: 'completed',
    guarantors: [
      { name: 'Abebe Kebede', amount: 40000, status: 'accepted' },
      { name: 'Tigist Hailu', amount: 40000, status: 'accepted' },
    ],
    purpose: 'Business expansion',
  },
];

// Dummy transactions data
export const dummyTransactions: DummyTransaction[] = [
  {
    id: 'txn-1',
    memberNumber: 'AM-2024-001',
    memberName: 'Abebe Kebede',
    type: 'savings_deposit',
    amount: 5000,
    balanceAfter: 125000,
    date: '2024-12-15',
    description: 'Monthly salary deduction',
  },
  {
    id: 'txn-2',
    memberNumber: 'AM-2024-001',
    memberName: 'Abebe Kebede',
    type: 'loan_repayment',
    amount: 4333,
    balanceAfter: 38000,
    date: '2024-12-15',
    description: 'Monthly loan repayment - Loan #loan-1',
  },
  {
    id: 'txn-3',
    memberNumber: 'AM-2024-002',
    memberName: 'Tigist Hailu',
    type: 'savings_deposit',
    amount: 4000,
    balanceAfter: 89000,
    date: '2024-12-15',
    description: 'Monthly salary deduction',
  },
  {
    id: 'txn-4',
    memberNumber: 'AM-2024-004',
    memberName: 'Meron Alemu',
    type: 'savings_deposit',
    amount: 3000,
    balanceAfter: 67000,
    date: '2024-12-15',
    description: 'Monthly salary deduction',
  },
  {
    id: 'txn-5',
    memberNumber: 'AM-2024-001',
    memberName: 'Abebe Kebede',
    type: 'interest_earned',
    amount: 520,
    balanceAfter: 120520,
    date: '2024-11-30',
    description: 'Quarterly interest credit',
  },
  {
    id: 'txn-6',
    memberNumber: 'AM-2024-005',
    memberName: 'Solomon Bekele',
    type: 'loan_disbursement',
    amount: 80000,
    balanceAfter: 80000,
    date: '2023-06-15',
    description: 'Loan disbursement - Short term loan',
    processedBy: 'Accountant',
  },
];

// Dummy savings accounts
export const dummySavingsAccounts: DummySavingsAccount[] = [
  {
    id: 'sav-1',
    memberNumber: 'AM-2024-001',
    memberName: 'Abebe Kebede',
    balance: 125000,
    monthlyContribution: 5000,
    totalInterestEarned: 3200,
    lastContributionDate: '2024-12-15',
  },
  {
    id: 'sav-2',
    memberNumber: 'AM-2024-002',
    memberName: 'Tigist Hailu',
    balance: 89000,
    monthlyContribution: 4000,
    totalInterestEarned: 1850,
    lastContributionDate: '2024-12-15',
  },
  {
    id: 'sav-3',
    memberNumber: 'AM-2024-004',
    memberName: 'Meron Alemu',
    balance: 67000,
    monthlyContribution: 3000,
    totalInterestEarned: 1120,
    lastContributionDate: '2024-12-15',
  },
  {
    id: 'sav-4',
    memberNumber: 'AM-2024-005',
    memberName: 'Solomon Bekele',
    balance: 156000,
    monthlyContribution: 6000,
    totalInterestEarned: 5400,
    lastContributionDate: '2024-10-15',
  },
];

// Dummy approvals pending
export const dummyApprovals: DummyApproval[] = [
  {
    id: 'appr-1',
    type: 'membership',
    applicantName: 'Dawit Tesfaye',
    memberNumber: 'AM-2024-003',
    submittedDate: '2024-12-01',
    status: 'pending',
    details: 'New membership application from Ethio Telecom employee',
  },
  {
    id: 'appr-2',
    type: 'loan',
    applicantName: 'Tigist Hailu',
    memberNumber: 'AM-2024-002',
    submittedDate: '2024-12-10',
    status: 'pending',
    details: 'Long-term loan for vehicle purchase',
    amount: 200000,
  },
  {
    id: 'appr-3',
    type: 'loan',
    applicantName: 'Meron Alemu',
    memberNumber: 'AM-2024-004',
    submittedDate: '2024-12-20',
    status: 'pending',
    details: 'Holiday loan request',
    amount: 15000,
  },
  {
    id: 'appr-4',
    type: 'savings_change',
    applicantName: 'Abebe Kebede',
    memberNumber: 'AM-2024-001',
    submittedDate: '2024-12-22',
    status: 'pending',
    details: 'Request to increase monthly contribution from 5000 to 7000 Birr',
    amount: 7000,
  },
];

// Dummy audit logs
export const dummyAuditLogs: DummyAuditLog[] = [
  {
    id: 'log-1',
    action: 'Loan Application Submitted',
    performedBy: 'Meron Alemu',
    role: 'Member',
    timestamp: '2024-12-20 14:30:00',
    details: 'Holiday loan application for 15,000 Birr',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'log-2',
    action: 'Loan Approved - Stage 1',
    performedBy: 'Fikadu Tadesse',
    role: 'Chairperson',
    timestamp: '2024-12-18 10:15:00',
    details: 'Approved loan #loan-2 for Tigist Hailu',
    ipAddress: '192.168.1.10',
  },
  {
    id: 'log-3',
    action: 'User Login',
    performedBy: 'Admin',
    role: 'Admin',
    timestamp: '2024-12-22 08:00:00',
    details: 'Successful login',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'log-4',
    action: 'Member Status Changed',
    performedBy: 'Admin',
    role: 'Admin',
    timestamp: '2024-12-15 16:45:00',
    details: 'Solomon Bekele status changed to suspended',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'log-5',
    action: 'Payment Processed',
    performedBy: 'Hana Girma',
    role: 'Accountant',
    timestamp: '2024-12-15 11:30:00',
    details: 'Processed monthly salary deductions for 45 members',
    ipAddress: '192.168.1.20',
  },
];

// Dashboard statistics
export const dashboardStats = {
  admin: {
    totalMembers: 156,
    activeMembers: 142,
    pendingApprovals: 8,
    totalSavings: 12500000,
    totalLoansActive: 89,
    totalLoanAmount: 8750000,
    systemUsers: 12,
    auditLogsToday: 45,
  },
  chairperson: {
    pendingMemberApprovals: 3,
    pendingLoanReviews: 5,
    approvedThisMonth: 12,
    rejectedThisMonth: 2,
    totalMembersOversight: 156,
  },
  loanCommittee: {
    pendingLoanReviews: 4,
    approvedThisMonth: 8,
    rejectedThisMonth: 1,
    totalLoansReviewed: 89,
    averageLoanAmount: 98314,
  },
  managementCommittee: {
    pendingFinalApprovals: 2,
    approvedThisMonth: 6,
    totalOperationalBudget: 15000000,
    monthlyDisbursements: 1250000,
  },
  accountant: {
    totalSavings: 12500000,
    monthlyCollections: 456000,
    pendingPayments: 12,
    reconciledToday: 89,
    pendingReconciliation: 5,
    totalDisbursementsMonth: 1250000,
  },
  member: {
    savingsBalance: 125000,
    monthlyContribution: 5000,
    activeLoan: 38000,
    monthlyPayment: 4333,
    nextPaymentDate: '2025-01-15',
    guaranteedAmount: 65000,
  },
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
