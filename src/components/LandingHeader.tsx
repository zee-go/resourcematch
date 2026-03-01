import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X, LogIn } from "lucide-react";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Browse Talent", href: "/dashboard" },
    { label: "Pricing", href: "/hire" },
    {
      label: "How It Works",
      href: "#how-it-works",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        document
          .getElementById("how-it-works")
          ?.scrollIntoView({ behavior: "smooth" });
        setMobileOpen(false);
      },
    },
    { label: "Apply", href: "/apply" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#04443C] to-[#022C27] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                scrolled ? "text-[#04443C]" : "text-[#04443C]"
              }`}
            >
              ResourceMatch
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={link.onClick}
                className="text-sm font-medium text-slate-700 hover:text-[#04443C] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="border-[#04443C] text-[#04443C] hover:bg-green-50"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-[#04443C] hover:bg-[#022C27] text-white"
              >
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#04443C]"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    link.onClick(e);
                  } else {
                    setMobileOpen(false);
                  }
                }}
                className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#04443C] hover:bg-green-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-2">
              <Link href="/login" className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#04443C] text-[#04443C]"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button
                  size="sm"
                  className="w-full bg-[#04443C] hover:bg-[#022C27] text-white"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
