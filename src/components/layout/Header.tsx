import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={logo} 
                alt="Addis Mesob Logo" 
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">
                Addis Mesob
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Savings & Loans
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Join Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full gap-2">
                    <UserPlus className="h-4 w-4" />
                    Join Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
