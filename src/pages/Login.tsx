import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img src={logo} alt="Addis Mesob" className="h-12 w-12" />
            <div>
              <span className="text-xl font-bold text-foreground">Addis Mesob</span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
                Savings & Loans
              </span>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to access your member dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Member ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or member ID"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Not a member yet?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Apply for membership
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="w-24 h-24 mx-auto mb-8">
            <img src={logo} alt="Addis Mesob" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Your Financial Partner
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Access your savings, apply for loans, and manage your cooperative 
            membership all in one secure platform.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-2xl font-bold text-accent">ETB 50M+</div>
              <div className="text-sm text-primary-foreground/60">Total Savings</div>
            </div>
            <div className="p-4 rounded-xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-2xl font-bold text-accent">2,500+</div>
              <div className="text-sm text-primary-foreground/60">Loans Processed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
