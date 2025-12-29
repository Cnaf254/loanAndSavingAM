import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ArrowLeft, 
  Wallet, 
  Calculator, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const LOAN_TYPES = {
  short_term: { 
    label: "Short Term Loan", 
    maxMonths: 12, 
    minMonths: 1,
    interestRate: 1.5, 
    description: "For urgent needs, repay within 1 year" 
  },
  long_term: { 
    label: "Long Term Loan", 
    maxMonths: 48, 
    minMonths: 12,
    interestRate: 1.0, 
    description: "For major investments, repay over 1-4 years" 
  },
  holiday: { 
    label: "Holiday Loan", 
    maxMonths: 6, 
    minMonths: 1,
    interestRate: 2.0, 
    description: "For festive seasons, repay within 6 months" 
  },
} as const;

const loanApplicationSchema = z.object({
  loan_type: z.enum(["short_term", "long_term", "holiday"], {
    required_error: "Please select a loan type",
  }),
  principal_amount: z
    .string()
    .min(1, "Amount is required")
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 1000, {
      message: "Minimum loan amount is ETB 1,000",
    })
    .refine((val) => val <= 500000, {
      message: "Maximum loan amount is ETB 500,000",
    }),
  term_months: z
    .string()
    .min(1, "Term is required")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: "Minimum term is 1 month",
    }),
  purpose: z
    .string()
    .min(10, "Please provide a detailed purpose (at least 10 characters)")
    .max(500, "Purpose must be less than 500 characters"),
});

type LoanApplicationFormValues = z.infer<typeof loanApplicationSchema>;

const LoanApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      loan_type: undefined,
      principal_amount: "" as any,
      term_months: "" as any,
      purpose: "",
    },
  });

  const selectedLoanType = form.watch("loan_type");
  const principalAmount = parseFloat(form.watch("principal_amount") as any) || 0;
  const termMonths = parseInt(form.watch("term_months") as any) || 0;

  const loanConfig = selectedLoanType ? LOAN_TYPES[selectedLoanType] : null;
  const interestRate = loanConfig?.interestRate || 0;
  
  // Calculate total interest and monthly payment
  const totalInterest = (principalAmount * interestRate * termMonths) / 100;
  const totalAmount = principalAmount + totalInterest;
  const monthlyPayment = termMonths > 0 ? totalAmount / termMonths : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const onSubmit = async (data: LoanApplicationFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to apply for a loan.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get member_id for the current user
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        throw new Error("Member record not found. Please complete your profile first.");
      }

      const principal = typeof data.principal_amount === 'string' 
        ? parseFloat(data.principal_amount) 
        : data.principal_amount;
      const term = typeof data.term_months === 'string' 
        ? parseInt(data.term_months) 
        : data.term_months;

      const calculatedInterest = (principal * interestRate * term) / 100;
      const calculatedTotal = principal + calculatedInterest;
      const calculatedMonthly = calculatedTotal / term;

      const { error: insertError } = await supabase
        .from('loans')
        .insert({
          member_id: memberData.id,
          loan_type: data.loan_type,
          principal_amount: principal,
          term_months: term,
          interest_rate: interestRate,
          total_amount: calculatedTotal,
          monthly_payment: calculatedMonthly,
          remaining_balance: calculatedTotal,
          purpose: data.purpose.trim(),
          status: 'pending_approval',
        });

      if (insertError) {
        throw insertError;
      }

      setIsSuccess(true);
      toast({
        title: "Application Submitted!",
        description: "Your loan application has been submitted for review.",
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Loan application error:', error);
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: error.message || "Failed to submit loan application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Application Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your loan application has been successfully submitted and is now pending approval.
              You will be notified once a decision has been made.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logo} alt="Addis Mesob" className="h-10 w-10" />
            <span className="text-lg font-bold text-foreground">Addis Mesob</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apply for a Loan</h1>
          <p className="text-muted-foreground">
            Fill out the form below to submit your loan application. All applications are reviewed by our loan committee.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Loan Details
                </CardTitle>
                <CardDescription>
                  Provide information about the loan you're requesting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Loan Type */}
                    <FormField
                      control={form.control}
                      name="loan_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a loan type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(LOAN_TYPES).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex flex-col">
                                    <span>{config.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {config.interestRate}% monthly interest
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {loanConfig && (
                            <FormDescription>
                              {loanConfig.description}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Principal Amount */}
                    <FormField
                      control={form.control}
                      name="principal_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Amount (ETB)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount between 1,000 - 500,000"
                              min="1000"
                              max="500000"
                              step="100"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum: ETB 1,000 | Maximum: ETB 500,000
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Term Months */}
                    <FormField
                      control={form.control}
                      name="term_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repayment Term (Months)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={loanConfig 
                                ? `${loanConfig.minMonths} - ${loanConfig.maxMonths} months` 
                                : "Select loan type first"}
                              min={loanConfig?.minMonths || 1}
                              max={loanConfig?.maxMonths || 48}
                              disabled={!selectedLoanType}
                              {...field}
                            />
                          </FormControl>
                          {loanConfig && (
                            <FormDescription>
                              {loanConfig.minMonths} to {loanConfig.maxMonths} months allowed for {loanConfig.label}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Purpose */}
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose of Loan</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what you will use this loan for..."
                              rows={4}
                              maxLength={500}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/500 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Important Notice */}
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground mb-1">Important Information</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Loan applications require at least 2 guarantors</li>
                          <li>• Processing takes 3-5 business days</li>
                          <li>• Maximum loan is 3x your total savings</li>
                        </ul>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Loan Calculator Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calculator Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  Loan Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {principalAmount > 0 && termMonths > 0 ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Principal Amount</span>
                        <span className="font-medium">ETB {formatCurrency(principalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Interest Rate</span>
                        <span className="font-medium">{interestRate}% / month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Term</span>
                        <span className="font-medium">{termMonths} months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Interest</span>
                        <span className="font-medium text-accent">ETB {formatCurrency(totalInterest)}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Repayment</span>
                          <span className="font-bold text-foreground">ETB {formatCurrency(totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        Monthly Payment
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        ETB {formatCurrency(monthlyPayment)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Enter loan details to see calculations</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loan Types Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(LOAN_TYPES).map(([key, config]) => (
                  <div 
                    key={key}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedLoanType === key 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="font-medium text-foreground">{config.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {config.interestRate}% monthly • {config.minMonths}-{config.maxMonths} months
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanApplication;
