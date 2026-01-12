import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center pt-20 gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            Your Financial Future,{" "}
            <span className="text-accent">Secured Together</span>
          </h1>

          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join Addis Mesob Cooperative for secure savings, accessible loans, 
            and a community that supports your financial growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="hero" size="lg" className="group">
                Become a Member
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero-outline" size="lg">
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
