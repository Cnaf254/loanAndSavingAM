import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, TrendingUp, Users, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Trusted by 5,000+ Members
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Your Financial Future,{" "}
            <span className="text-accent">Secured Together</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Join Addis Mesob Cooperative for secure savings, accessible loans, 
            and a community that supports your financial growth every step of the way.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Become a Member
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero-outline" size="xl">
                Member Login
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {[
              { icon: Users, value: "5,000+", label: "Active Members" },
              { icon: TrendingUp, value: "ETB 50M+", label: "Total Savings" },
              { icon: Shield, value: "99.9%", label: "Secure Transactions" },
              { icon: ArrowRight, value: "2,500+", label: "Loans Processed" },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-2xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10 hover:bg-card/20 transition-all duration-300"
              >
                <stat.icon className="h-8 w-8 text-accent mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-accent animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
