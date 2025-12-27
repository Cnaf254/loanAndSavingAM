import { 
  PiggyBank, 
  Wallet, 
  CalendarCheck, 
  Building2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  const services = [
    {
      icon: PiggyBank,
      title: "Savings Account",
      description: "Build your savings with competitive interest rates and automatic salary deductions.",
      features: [
        "Automated monthly deposits",
        "Real-time balance tracking",
        "Downloadable statements",
        "No minimum balance fees"
      ],
      color: "primary"
    },
    {
      icon: Wallet,
      title: "Short-term Loans",
      description: "Quick access to funds for emergency needs with flexible repayment terms.",
      features: [
        "Up to 3x your savings",
        "Fast approval process",
        "Low interest rates",
        "12-month repayment"
      ],
      color: "accent"
    },
    {
      icon: CalendarCheck,
      title: "Holiday Loans",
      description: "Special seasonal loans for celebrations, travel, and family occasions.",
      features: [
        "Seasonal availability",
        "Quick disbursement",
        "Flexible amounts",
        "Easy repayment terms"
      ],
      color: "primary"
    },
    {
      icon: Building2,
      title: "Long-term Loans",
      description: "Major financing for life's big investments like property and business.",
      features: [
        "Higher loan limits",
        "Extended terms up to 5 years",
        "Competitive rates",
        "Property & business eligible"
      ],
      color: "accent"
    }
  ];

  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Financial Solutions for{" "}
            <span className="text-primary">Every Need</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From building your savings to accessing loans, we provide comprehensive 
            financial services designed for our community's unique needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group relative bg-card rounded-2xl border border-border p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl mb-6 ${
                service.color === 'accent' 
                  ? 'bg-accent/10 text-accent' 
                  : 'bg-primary/10 text-primary'
              }`}>
                <service.icon className="h-8 w-8" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${
                      service.color === 'accent' ? 'text-accent' : 'text-primary'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/register">
                <Button 
                  variant={service.color === 'accent' ? 'hero' : 'default'} 
                  className="group/btn"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>

              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-tr-2xl rounded-bl-[100px] opacity-10 ${
                service.color === 'accent' ? 'bg-accent' : 'bg-primary'
              }`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
