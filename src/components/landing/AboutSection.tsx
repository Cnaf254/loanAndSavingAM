const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            About <span className="text-primary">Addis Mesob</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Serving our community since 2010, we provide trusted savings and loan services 
            to thousands of members. We believe in the power of collective financial support.
          </p>
          
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">14+</div>
              <div className="text-sm text-muted-foreground">Years of Service</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">5,000+</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">ETB 50M+</div>
              <div className="text-sm text-muted-foreground">Total Savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
