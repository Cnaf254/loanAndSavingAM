import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  User,
  Building2,
  CreditCard,
  Phone,
  Heart,
  Loader2,
  Save,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import { z } from "zod";

// Validation schemas
const personalInfoSchema = z.object({
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().max(200, "Address must be less than 200 characters").optional(),
  city: z.string().max(50, "City must be less than 50 characters").optional(),
  region: z.string().max(50, "Region must be less than 50 characters").optional(),
});

const employmentSchema = z.object({
  employer: z.string().max(100, "Employer name must be less than 100 characters").optional(),
  employee_id: z.string().max(50, "Employee ID must be less than 50 characters").optional(),
  department: z.string().max(50, "Department must be less than 50 characters").optional(),
  monthly_salary: z.string().optional(),
});

const bankSchema = z.object({
  bank_name: z.string().max(100, "Bank name must be less than 100 characters").optional(),
  bank_account: z.string().max(30, "Account number must be less than 30 characters").optional(),
});

const emergencySchema = z.object({
  emergency_contact_name: z.string().max(100, "Name must be less than 100 characters").optional(),
  emergency_contact_phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
});

const heirSchema = z.object({
  heir_name: z.string().max(100, "Name must be less than 100 characters").optional(),
  heir_relationship: z.string().max(50, "Relationship must be less than 50 characters").optional(),
  heir_phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
});

interface MemberData {
  id: string;
  member_number: string;
  status: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  employer: string | null;
  employee_id: string | null;
  department: string | null;
  monthly_salary: number | null;
  bank_name: string | null;
  bank_account: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  heir_name: string | null;
  heir_relationship: string | null;
  heir_phone: string | null;
}

const MemberProfile = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    region: "",
  });
  
  const [employment, setEmployment] = useState({
    employer: "",
    employee_id: "",
    department: "",
    monthly_salary: "",
  });
  
  const [bankInfo, setBankInfo] = useState({
    bank_name: "",
    bank_account: "",
  });
  
  const [emergencyContact, setEmergencyContact] = useState({
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });
  
  const [heirInfo, setHeirInfo] = useState({
    heir_name: "",
    heir_relationship: "",
    heir_phone: "",
  });
  
  const { profile, signOut, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setMemberData(data);
        setPersonalInfo({
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          address: data.address || "",
          city: data.city || "",
          region: data.region || "",
        });
        setEmployment({
          employer: data.employer || "",
          employee_id: data.employee_id || "",
          department: data.department || "",
          monthly_salary: data.monthly_salary?.toString() || "",
        });
        setBankInfo({
          bank_name: data.bank_name || "",
          bank_account: data.bank_account || "",
        });
        setEmergencyContact({
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
        });
        setHeirInfo({
          heir_name: data.heir_name || "",
          heir_relationship: data.heir_relationship || "",
          heir_phone: data.heir_phone || "",
        });
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const validateAndSave = async (section: string) => {
    setErrors({});
    setSaving(true);

    try {
      let updateData: Record<string, unknown> = {};
      
      switch (section) {
        case 'personal':
          const personalResult = personalInfoSchema.safeParse(personalInfo);
          if (!personalResult.success) {
            const fieldErrors: Record<string, string> = {};
            personalResult.error.errors.forEach(err => {
              fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setSaving(false);
            return;
          }
          updateData = {
            ...personalInfo,
            date_of_birth: personalInfo.date_of_birth || null,
          };
          break;
          
        case 'employment':
          const employmentResult = employmentSchema.safeParse(employment);
          if (!employmentResult.success) {
            const fieldErrors: Record<string, string> = {};
            employmentResult.error.errors.forEach(err => {
              fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setSaving(false);
            return;
          }
          updateData = {
            employer: employment.employer || null,
            employee_id: employment.employee_id || null,
            department: employment.department || null,
            monthly_salary: employment.monthly_salary ? parseFloat(employment.monthly_salary) : null,
          };
          break;
          
        case 'bank':
          const bankResult = bankSchema.safeParse(bankInfo);
          if (!bankResult.success) {
            const fieldErrors: Record<string, string> = {};
            bankResult.error.errors.forEach(err => {
              fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setSaving(false);
            return;
          }
          updateData = {
            bank_name: bankInfo.bank_name || null,
            bank_account: bankInfo.bank_account || null,
          };
          break;
          
        case 'emergency':
          const emergencyResult = emergencySchema.safeParse(emergencyContact);
          if (!emergencyResult.success) {
            const fieldErrors: Record<string, string> = {};
            emergencyResult.error.errors.forEach(err => {
              fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setSaving(false);
            return;
          }
          updateData = {
            emergency_contact_name: emergencyContact.emergency_contact_name || null,
            emergency_contact_phone: emergencyContact.emergency_contact_phone || null,
          };
          break;
          
        case 'heir':
          const heirResult = heirSchema.safeParse(heirInfo);
          if (!heirResult.success) {
            const fieldErrors: Record<string, string> = {};
            heirResult.error.errors.forEach(err => {
              fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            setSaving(false);
            return;
          }
          updateData = {
            heir_name: heirInfo.heir_name || null,
            heir_relationship: heirInfo.heir_relationship || null,
            heir_phone: heirInfo.heir_phone || null,
          };
          break;
      }

      if (!memberData?.id) throw new Error("Member data not found");

      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', memberData.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
      
      // Refresh member data
      fetchMemberData();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Savings", icon: PiggyBank, href: "/dashboard/savings" },
    { name: "Loans", icon: Wallet, href: "/dashboard/loans" },
    { name: "Statements", icon: FileText, href: "/dashboard/statements" },
    { name: "Guarantors", icon: Users, href: "/dashboard/guarantors" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings", active: true },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending Approval" },
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      suspended: { className: "bg-red-100 text-red-800", label: "Suspended" },
      inactive: { className: "bg-gray-100 text-gray-800", label: "Inactive" },
    };
    const c = config[status] || { className: "bg-gray-100 text-gray-800", label: status };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.className}`}>{c.label}</span>;
  };

  const calculateCompletion = () => {
    if (!memberData) return 0;
    const fields = [
      memberData.date_of_birth,
      memberData.gender,
      memberData.address,
      memberData.employer,
      memberData.monthly_salary,
      memberData.bank_name,
      memberData.bank_account,
      memberData.emergency_contact_name,
      memberData.emergency_contact_phone,
      memberData.heir_name,
    ];
    const filled = fields.filter(f => f !== null && f !== "").length;
    return Math.round((filled / fields.length) * 100);
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

          <div className="p-4 border-t border-sidebar-border space-y-2">
            {isStaff() && (
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                asChild
              >
                <Link to="/admin">
                  <Shield className="h-5 w-5" />
                  <span>Admin Portal</span>
                </Link>
              </Button>
            )}
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
              <div>
                <h1 className="text-xl font-bold text-foreground">My Profile</h1>
                <p className="text-sm text-muted-foreground">Complete your membership information</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {memberData?.member_number || 'Loading...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{userName}</h2>
                        <p className="text-muted-foreground">{profile?.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm text-muted-foreground">
                            Member #{memberData?.member_number}
                          </span>
                          {memberData && getStatusBadge(memberData.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${calculateCompletion() * 2.26} 226`}
                            className="text-primary"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                          {calculateCompletion()}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Profile Completion</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Tabs */}
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                  <TabsTrigger value="personal" className="gap-2">
                    <User className="h-4 w-4 hidden sm:block" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="employment" className="gap-2">
                    <Building2 className="h-4 w-4 hidden sm:block" />
                    Employment
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="gap-2">
                    <CreditCard className="h-4 w-4 hidden sm:block" />
                    Bank
                  </TabsTrigger>
                  <TabsTrigger value="emergency" className="gap-2">
                    <Phone className="h-4 w-4 hidden sm:block" />
                    Emergency
                  </TabsTrigger>
                  <TabsTrigger value="heir" className="gap-2">
                    <Heart className="h-4 w-4 hidden sm:block" />
                    Heir
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Your basic personal details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input
                            id="dob"
                            type="date"
                            value={personalInfo.date_of_birth}
                            onChange={(e) => setPersonalInfo({...personalInfo, date_of_birth: e.target.value})}
                          />
                          {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select 
                            value={personalInfo.gender} 
                            onValueChange={(val) => setPersonalInfo({...personalInfo, gender: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="Enter your address"
                          value={personalInfo.address}
                          onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                        />
                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="Enter city"
                            value={personalInfo.city}
                            onChange={(e) => setPersonalInfo({...personalInfo, city: e.target.value})}
                          />
                          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Region</Label>
                          <Input
                            id="region"
                            placeholder="Enter region"
                            value={personalInfo.region}
                            onChange={(e) => setPersonalInfo({...personalInfo, region: e.target.value})}
                          />
                          {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => validateAndSave('personal')} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Employment Information */}
                <TabsContent value="employment">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Employment Information
                      </CardTitle>
                      <CardDescription>
                        Your workplace and salary details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employer">Employer Name</Label>
                          <Input
                            id="employer"
                            placeholder="Enter employer name"
                            value={employment.employer}
                            onChange={(e) => setEmployment({...employment, employer: e.target.value})}
                          />
                          {errors.employer && <p className="text-sm text-destructive">{errors.employer}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee_id">Employee ID</Label>
                          <Input
                            id="employee_id"
                            placeholder="Enter employee ID"
                            value={employment.employee_id}
                            onChange={(e) => setEmployment({...employment, employee_id: e.target.value})}
                          />
                          {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id}</p>}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            placeholder="Enter department"
                            value={employment.department}
                            onChange={(e) => setEmployment({...employment, department: e.target.value})}
                          />
                          {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary">Monthly Salary (ETB)</Label>
                          <Input
                            id="salary"
                            type="number"
                            placeholder="Enter monthly salary"
                            value={employment.monthly_salary}
                            onChange={(e) => setEmployment({...employment, monthly_salary: e.target.value})}
                          />
                          {errors.monthly_salary && <p className="text-sm text-destructive">{errors.monthly_salary}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => validateAndSave('employment')} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bank Information */}
                <TabsContent value="bank">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Bank Information
                      </CardTitle>
                      <CardDescription>
                        Your bank account details for disbursements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_name">Bank Name</Label>
                          <Select 
                            value={bankInfo.bank_name} 
                            onValueChange={(val) => setBankInfo({...bankInfo, bank_name: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="commercial_bank">Commercial Bank of Ethiopia</SelectItem>
                              <SelectItem value="awash_bank">Awash Bank</SelectItem>
                              <SelectItem value="dashen_bank">Dashen Bank</SelectItem>
                              <SelectItem value="abyssinia_bank">Bank of Abyssinia</SelectItem>
                              <SelectItem value="wegagen_bank">Wegagen Bank</SelectItem>
                              <SelectItem value="united_bank">United Bank</SelectItem>
                              <SelectItem value="nib_bank">Nib International Bank</SelectItem>
                              <SelectItem value="coop_bank">Cooperative Bank of Oromia</SelectItem>
                              <SelectItem value="zemen_bank">Zemen Bank</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.bank_name && <p className="text-sm text-destructive">{errors.bank_name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_account">Account Number</Label>
                          <Input
                            id="bank_account"
                            placeholder="Enter account number"
                            value={bankInfo.bank_account}
                            onChange={(e) => setBankInfo({...bankInfo, bank_account: e.target.value})}
                          />
                          {errors.bank_account && <p className="text-sm text-destructive">{errors.bank_account}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => validateAndSave('bank')} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Emergency Contact */}
                <TabsContent value="emergency">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Emergency Contact
                      </CardTitle>
                      <CardDescription>
                        Person to contact in case of emergency
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergency_name">Contact Name</Label>
                          <Input
                            id="emergency_name"
                            placeholder="Enter contact name"
                            value={emergencyContact.emergency_contact_name}
                            onChange={(e) => setEmergencyContact({...emergencyContact, emergency_contact_name: e.target.value})}
                          />
                          {errors.emergency_contact_name && <p className="text-sm text-destructive">{errors.emergency_contact_name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergency_phone">Phone Number</Label>
                          <Input
                            id="emergency_phone"
                            placeholder="Enter phone number"
                            value={emergencyContact.emergency_contact_phone}
                            onChange={(e) => setEmergencyContact({...emergencyContact, emergency_contact_phone: e.target.value})}
                          />
                          {errors.emergency_contact_phone && <p className="text-sm text-destructive">{errors.emergency_contact_phone}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => validateAndSave('emergency')} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Heir Information */}
                <TabsContent value="heir">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Heir Information
                      </CardTitle>
                      <CardDescription>
                        Designated beneficiary for your savings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="heir_name">Heir Name</Label>
                          <Input
                            id="heir_name"
                            placeholder="Enter heir's full name"
                            value={heirInfo.heir_name}
                            onChange={(e) => setHeirInfo({...heirInfo, heir_name: e.target.value})}
                          />
                          {errors.heir_name && <p className="text-sm text-destructive">{errors.heir_name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heir_relationship">Relationship</Label>
                          <Select 
                            value={heirInfo.heir_relationship} 
                            onValueChange={(val) => setHeirInfo({...heirInfo, heir_relationship: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.heir_relationship && <p className="text-sm text-destructive">{errors.heir_relationship}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heir_phone">Heir Phone Number</Label>
                        <Input
                          id="heir_phone"
                          placeholder="Enter heir's phone number"
                          value={heirInfo.heir_phone}
                          onChange={(e) => setHeirInfo({...heirInfo, heir_phone: e.target.value})}
                        />
                        {errors.heir_phone && <p className="text-sm text-destructive">{errors.heir_phone}</p>}
                      </div>
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => validateAndSave('heir')} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MemberProfile;
