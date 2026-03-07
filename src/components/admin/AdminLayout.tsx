import Link from "next/link";
import { useRouter } from "next/router";
import { LogoIcon } from "@/components/LogoIcon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FlaskConical, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Shield },
    { href: "/admin/vetting", label: "AI Vetting", icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <LogoIcon className="w-7 h-7" color="primary" />
                <span className="text-xl font-heading font-bold text-slate-900">ResourceMatch</span>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  Admin
                </Badge>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={isActive ? "bg-primary text-white" : "text-slate-600"}
                      >
                        <item.icon className="w-4 h-4 mr-1.5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-slate-500"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
