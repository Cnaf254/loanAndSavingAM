import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-16 gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Join?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Become a member today and start your journey to financial security.
          </p>

          <Link to="/register">
            <Button variant="hero" size="lg" className="group">
              Apply for Membership
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <div className="mt-8 text-primary-foreground/70 text-sm">
            <p>Bole Road, Addis Ababa • +251 911 234 567 • info@addismesob.com</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
