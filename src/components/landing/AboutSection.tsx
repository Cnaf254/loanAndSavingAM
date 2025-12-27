import { Target, Heart, Award, TrendingUp } from "lucide-react";

const AboutSection = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower our community members through accessible savings and loan services, fostering financial independence and collective growth."
    },
    {
      icon: Heart,
      title: "Our Values",
      description: "Integrity, transparency, and member-first approach guide every decision we make. Your trust is our greatest asset."
    },
    {
      icon: Award,
      title: "Our Promise",
      description: "Fair interest rates, quick loan processing, and personalized service for every member, regardless of their financial background."
    },
    {
      icon: TrendingUp,
      title: "Our Impact",
      description: "Over a decade of helping members achieve their financial goals, from emergency funds to home ownership and business growth."
    }
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Building Financial{" "}
              <span className="text-primary">Security Together</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Addis Mesob Cooperative has been serving our community since 2010, 
              providing trusted savings and loan services to thousands of members. 
              We believe in the power of collective financial support and are 
              committed to helping every member achieve their dreams.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="text-4xl font-bold text-primary mb-2">14+</div>
                <div className="text-sm text-muted-foreground">Years of Service</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-accent/10 border border-accent/20">
                <div className="text-4xl font-bold text-accent mb-2">5,000+</div>
                <div className="text-sm text-muted-foreground">Happy Members</div>
              </div>
            </div>
          </div>

          {/* Right Content - Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
