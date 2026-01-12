import { PiggyBank, Wallet, CalendarCheck, Building2 } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: PiggyBank,
      title: "Savings Account",
      description: "Build your savings with competitive interest rates and automatic deposits.",
    },
    {
      icon: Wallet,
      title: "Short-term Loans",
      description: "Quick access to funds for emergency needs with flexible repayment.",
    },
    {
      icon: CalendarCheck,
      title: "Holiday Loans",
      description: "Special seasonal loans for celebrations and family occasions.",
    },
    {
      icon: Building2,
      title: "Long-term Loans",
      description: "Major financing for property and business investments.",
    }
  ];

  return (
    <section id="services" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comprehensive financial services designed for our community's needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
