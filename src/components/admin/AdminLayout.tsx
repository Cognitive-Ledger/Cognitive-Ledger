import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import {
  LayoutDashboard,
  FileText,
  Cpu,
  Zap,
  Calendar,
  LogOut,
  ChevronLeft,
  Video,
  Headphones,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Articles", href: "/admin/articles", icon: FileText },
  { name: "Videos", href: "/admin/videos", icon: Video },
  { name: "AI Models", href: "/admin/models", icon: Cpu },
  { name: "Podcasts", href: "/admin/podcasts", icon: Headphones },
  { name: "Live Streams", href: "/admin/streams", icon: Radio },
  { name: "Breaking News", href: "/admin/breaking", icon: Zap },
  { name: "Daily Brief", href: "/admin/daily-brief", icon: Calendar },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasAccess, isLoading: roleLoading, role } = useHasEditorialAccess();

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-64 border-r border-border p-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="headline-primary mb-4">Access Denied</h1>
          <p className="body-text text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard. Contact an
            administrator to request editorial access.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back to site</span>
          </Link>
          <h1 className="headline-tertiary mt-4">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{role}</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-3 truncate">
            {user.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
