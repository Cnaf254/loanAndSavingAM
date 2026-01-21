import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SystemAdminDashboard from "./pages/dashboards/SystemAdminDashboard";
import ChairpersonDashboard from "./pages/dashboards/ChairpersonDashboard";
import LoanCommitteeDashboard from "./pages/dashboards/LoanCommitteeDashboard";
import ManagementCommitteeDashboard from "./pages/dashboards/ManagementCommitteeDashboard";
import AccountantDashboard from "./pages/dashboards/AccountantDashboard";
import MemberDashboard from "./pages/dashboards/MemberDashboard";
import LoanApplication from "./pages/LoanApplication";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Protected role-based dashboards */}
            <Route path="/admin" element={<ProtectedRoute><SystemAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><SystemAdminDashboard /></ProtectedRoute>} />
            
            <Route path="/chairperson" element={<ProtectedRoute><ChairpersonDashboard /></ProtectedRoute>} />
            <Route path="/chairperson/*" element={<ProtectedRoute><ChairpersonDashboard /></ProtectedRoute>} />
            
            <Route path="/loan-committee" element={<ProtectedRoute><LoanCommitteeDashboard /></ProtectedRoute>} />
            <Route path="/loan-committee/*" element={<ProtectedRoute><LoanCommitteeDashboard /></ProtectedRoute>} />
            
            <Route path="/management" element={<ProtectedRoute><ManagementCommitteeDashboard /></ProtectedRoute>} />
            <Route path="/management/*" element={<ProtectedRoute><ManagementCommitteeDashboard /></ProtectedRoute>} />
            
            <Route path="/accountant" element={<ProtectedRoute><AccountantDashboard /></ProtectedRoute>} />
            <Route path="/accountant/*" element={<ProtectedRoute><AccountantDashboard /></ProtectedRoute>} />
            
            <Route path="/member" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
            <Route path="/member/*" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />

            {/* Utility routes */}
            <Route path="/loan-application" element={<ProtectedRoute><LoanApplication /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
