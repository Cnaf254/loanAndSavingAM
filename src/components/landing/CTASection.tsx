import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Start Your{" "}
            <span className="text-accent">Financial Journey?</span>
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            Join thousands of members who have secured their financial future with 
            Addis Mesob. Become a member today and access savings, loans, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Apply for Membership
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="tel:+251911234567">
              <Button variant="hero-outline" size="xl" className="gap-2">
                <Phone className="h-5 w-5" />
                Call Us Now
              </Button>
            </a>
          </div>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-accent font-semibold mb-2">Visit Us</div>
              <div className="text-primary-foreground/70 text-sm">
                Bole Road, Addis Ababa<br />
                Monday - Friday: 8:30 AM - 5:30 PM
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-accent font-semibold mb-2">Call Us</div>
              <div className="text-primary-foreground/70 text-sm">
                +251 911 234 567<br />
                +251 922 345 678
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-card/10 backdrop-blur-sm border border-primary-foreground/10">
              <div className="text-accent font-semibold mb-2">Email Us</div>
              <div className="text-primary-foreground/70 text-sm">
                info@addismesob.com<br />
                support@addismesob.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
