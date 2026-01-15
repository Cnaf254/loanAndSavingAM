import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import StaffRoute from "@/components/StaffRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LoanApplication from "./pages/LoanApplication";
import SavingsManagement from "./pages/SavingsManagement";
import AdminDashboard from "./pages/AdminDashboard";
import LoanApproval from "./pages/LoanApproval";
import GuarantorManagement from "./pages/GuarantorManagement";
import MemberProfile from "./pages/MemberProfile";
import NotFound from "./pages/NotFound";

// Role-specific dashboards
import SystemAdminDashboard from "./pages/dashboards/SystemAdminDashboard";
import ChairpersonDashboard from "./pages/dashboards/ChairpersonDashboard";
import LoanCommitteeDashboard from "./pages/dashboards/LoanCommitteeDashboard";
import ManagementCommitteeDashboard from "./pages/dashboards/ManagementCommitteeDashboard";
import AccountantDashboard from "./pages/dashboards/AccountantDashboard";
import MemberDashboard from "./pages/dashboards/MemberDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Role-specific dashboards (using dummy data) */}
            <Route path="/admin" element={<SystemAdminDashboard />} />
            <Route path="/admin/*" element={<SystemAdminDashboard />} />
            <Route path="/chairperson" element={<ChairpersonDashboard />} />
            <Route path="/chairperson/*" element={<ChairpersonDashboard />} />
            <Route path="/loan-committee" element={<LoanCommitteeDashboard />} />
            <Route path="/loan-committee/*" element={<LoanCommitteeDashboard />} />
            <Route path="/management" element={<ManagementCommitteeDashboard />} />
            <Route path="/management/*" element={<ManagementCommitteeDashboard />} />
            <Route path="/accountant" element={<AccountantDashboard />} />
            <Route path="/accountant/*" element={<AccountantDashboard />} />
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/*" element={<MemberDashboard />} />
            
            {/* Legacy routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/loan-application" element={<ProtectedRoute><LoanApplication /></ProtectedRoute>} />
            <Route path="/savings" element={<ProtectedRoute><SavingsManagement /></ProtectedRoute>} />
            <Route path="/dashboard/guarantors" element={<ProtectedRoute><GuarantorManagement /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
