import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRoleDashboardRoute, getRoleDisplayName, getAllRoles } from "@/utils/roleRoutes";
import type { Database } from "@/integrations/supabase/types";
import logo from "@/assets/logo.png";
import { 
  Shield, 
  Users, 
  Wallet, 
  FileCheck, 
  Calculator, 
  User 
} from "lucide-react";

type AppRole = Database['public']['Enums']['app_role'];

const roleIcons: Record<AppRole, typeof Shield> = {
  admin: Shield,
  chairperson: Users,
  management_committee: FileCheck,
  loan_committee: Wallet,
  accountant: Calculator,
  member: User,
};

const Login = () => {
  const { signIn, user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && roles.length > 0) {
      navigate(getRoleDashboardRoute(roles), { replace: true });
    }
  }, [user, roles, navigate]);

  const handleLogin = (role: AppRole) => {
    signIn(role);
    toast({
      title: "Welcome!",
      description: `Logged in as ${getRoleDisplayName(role)}`,
    });
    navigate(getRoleDashboardRoute([role]));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Addis Mesob" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-2xl">Addis Mesob SACCO</CardTitle>
            <CardDescription className="mt-2">
              Select a role to login (Demo Mode)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {getAllRoles().map((role) => {
            const Icon = roleIcons[role];
            return (
              <Button
                key={role}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => handleLogin(role)}
              >
                <Icon className="h-5 w-5 text-primary" />
                <span>{getRoleDisplayName(role)}</span>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
