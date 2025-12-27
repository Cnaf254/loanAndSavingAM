import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin,
  ArrowUpRight
} from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Our Services", href: "#services" },
    { name: "Membership", href: "/register" },
    { name: "Contact", href: "#contact" },
  ];

  const services = [
    { name: "Savings Account", href: "#" },
    { name: "Personal Loans", href: "#" },
    { name: "Holiday Loans", href: "#" },
    { name: "Long-term Loans", href: "#" },
  ];

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img 
                src={logo} 
                alt="Addis Mesob Logo" 
                className="h-14 w-14 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-sidebar-foreground">
                  Addis Mesob
                </span>
                <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
                  Savings & Loans
                </span>
              </div>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed mb-6">
              Empowering our community through cooperative savings and accessible loans. 
              Building financial security together since 2010.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-all duration-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-sidebar-foreground">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sidebar-foreground/70 hover:text-sidebar-primary flex items-center gap-2 group transition-colors duration-200"
                  >
                    <ArrowUpRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-sidebar-foreground">
              Our Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a 
                    href={service.href}
                    className="text-sidebar-foreground/70 hover:text-sidebar-primary flex items-center gap-2 group transition-colors duration-200"
                  >
                    <ArrowUpRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-sidebar-foreground">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <span className="text-sidebar-foreground/70 text-sm">
                  Bole Road, Addis Ababa<br />
                  Ethiopia, 1000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-sidebar-primary flex-shrink-0" />
                <a 
                  href="tel:+251911234567" 
                  className="text-sidebar-foreground/70 hover:text-sidebar-primary text-sm transition-colors"
                >
                  +251 911 234 567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-sidebar-primary flex-shrink-0" />
                <a 
                  href="mailto:info@addismesob.com" 
                  className="text-sidebar-foreground/70 hover:text-sidebar-primary text-sm transition-colors"
                >
                  info@addismesob.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sidebar-foreground/60 text-sm">
              © {currentYear} Addis Mesob Cooperative. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
