import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Front Page", href: "/" },
  { name: "Breaking AI", href: "/breaking" },
  { name: "Research", href: "/research" },
  { name: "Companies", href: "/companies" },
  { name: "Policy & Ethics", href: "/policy" },
  { name: "Models & Tools", href: "/models" },
  { name: "Opinion", href: "/opinion" },
  { name: "Explainers", href: "/explainers" },
  { name: "AI Index", href: "/ai-index" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-divider bg-background sticky top-0 z-50">
      {/* Top bar with date */}
      <div className="border-b border-divider">
        <div className="container py-2 flex justify-between items-center">
          <span className="text-caption text-xs">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-xs font-medium">
              Subscribe
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-medium flex items-center gap-1"
                onClick={handleSignOut}
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-medium"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-6">
        <div className="flex flex-col items-center">
          <Link to="/" className="text-center">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-headline">
              Cognitive Ledger
            </h1>
            <p className="text-caption text-xs mt-1 tracking-widest">
              INDEPENDENT JOURNALISM FOR ARTIFICIAL INTELLIGENCE
            </p>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t border-divider">
        <div className="container">
          {/* Desktop navigation */}
          <div className="hidden lg:flex justify-center items-center py-3 gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-3 py-1.5 text-sm font-medium text-body-text hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <button className="ml-4 p-1.5 text-body-text hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile navigation toggle */}
          <div className="lg:hidden flex justify-between items-center py-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-body-text"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button className="p-2 text-body-text">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-divider py-4 animate-slide-up">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-2 text-sm font-medium text-body-text hover:bg-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
