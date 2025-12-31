import { Link } from "react-router-dom";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

const footerLinks = {
  sections: [
    { name: "Front Page", href: "/" },
    { name: "Breaking AI", href: "/breaking" },
    { name: "Research", href: "/research" },
    { name: "Companies", href: "/companies" },
    { name: "Policy & Ethics", href: "/policy" },
    { name: "AI Index", href: "/ai-index" },
  ],
  about: [
    { name: "About Us", href: "/about" },
    { name: "Editorial Standards", href: "/standards" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-divider bg-secondary/30 mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <h2 className="font-serif text-xl font-medium text-headline">
                Cognitive Ledger
              </h2>
            </Link>
            <p className="mt-3 text-sm text-caption leading-relaxed max-w-sm">
              Independent journalism covering artificial intelligence research, 
              policy, and industry developments.
            </p>
            
            {/* Newsletter in Footer */}
            <div className="mt-6">
              <NewsletterSignup variant="footer" />
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-caption mb-4">
              Sections
            </h3>
            <ul className="space-y-2">
              {footerLinks.sections.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-body-text hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-caption mb-4">
              About
            </h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-body-text hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-caption mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-body-text hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-divider">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-caption">
              © {new Date().getFullYear()} Cognitive Ledger. All rights reserved.
            </p>
            <p className="text-xs text-caption">
              Human-edited. AI-assisted.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
