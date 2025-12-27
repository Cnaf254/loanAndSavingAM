import { 
  Shield, 
  Smartphone, 
  Clock, 
  BarChart3,
  Users,
  FileText,
  Bell,
  Languages
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade encryption and secure authentication protocols."
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your account anytime, anywhere from any device with our responsive platform."
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Check balances, apply for loans, and manage your savings around the clock."
    },
    {
      icon: BarChart3,
      title: "Real-time Dashboard",
      description: "Track your savings growth and loan status with intuitive visual analytics."
    },
    {
      icon: Users,
      title: "Multi-level Approvals",
      description: "Transparent approval process with committee oversight for all major transactions."
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description: "Generate and download statements, receipts, and financial reports instantly."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed with alerts for payments, approvals, and important updates."
    },
    {
      icon: Languages,
      title: "Multi-language Support",
      description: "Use the system in English or Amharic based on your preference."
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built for{" "}
            <span className="text-accent">Modern Cooperatives</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive digital platform designed to streamline operations 
            and enhance the member experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
