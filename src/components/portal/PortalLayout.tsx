import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Send,
  Clock,
  LogOut,
  Video,
  Brain,
  Headphones,
  Radio,
  Zap,
  Calendar,
  Mail,
  Users,
  ClipboardCheck,
  Shield,
  ChevronLeft,
  Settings,

} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface PortalLayoutProps {
  children: ReactNode;
  requiredRole?: AppRole | "any";
}

const adminNavigation = [
  { name: "Dashboard", href: "/portal/admin", icon: LayoutDashboard },
  { name: "Articles", href: "/portal/admin/articles", icon: FileText },
  { name: "Videos", href: "/portal/admin/videos", icon: Video },
  { name: "AI Models", href: "/portal/admin/models", icon: Brain },
  { name: "Podcasts", href: "/portal/admin/podcasts", icon: Headphones },
  { name: "Live Streams", href: "/portal/admin/streams", icon: Radio },
  { name: "Breaking News", href: "/portal/admin/breaking", icon: Zap },
  { name: "Daily Brief", href: "/portal/admin/daily-brief", icon: Calendar },
  { name: "Newsletter", href: "/portal/admin/newsletter", icon: Mail },
  { name: "Team", href: "/portal/admin/team", icon: Users },
  { name: "Settings", href: "/portal/settings", icon: Settings },
];

const editorNavigation = [
  { name: "Dashboard", href: "/portal/editor", icon: LayoutDashboard },
  { name: "Articles", href: "/portal/editor/articles", icon: FileText },
  { name: "Videos", href: "/portal/editor/videos", icon: Video },
  { name: "AI Models", href: "/portal/editor/models", icon: Brain },
  { name: "Podcasts", href: "/portal/editor/podcasts", icon: Headphones },
  { name: "Live Streams", href: "/portal/editor/streams", icon: Radio },
  { name: "Breaking News", href: "/portal/editor/breaking", icon: Zap },
  { name: "Daily Brief", href: "/portal/editor/daily-brief", icon: Calendar },
  { name: "Newsletter", href: "/portal/editor/newsletter", icon: Mail },
  { name: "Review Queue", href: "/portal/editor/review", icon: ClipboardCheck },
  { name: "Settings", href: "/portal/settings", icon: Settings },
];

const contributorNavigation = [
  { name: "Dashboard", href: "/portal/contributor", icon: LayoutDashboard },
  { name: "My Submissions", href: "/portal/contributor/submissions", icon: FileText },
  { name: "Submit Article", href: "/portal/contributor/submit", icon: Send },
  { name: "Pending Review", href: "/portal/contributor/pending", icon: Clock },
  { name: "Settings", href: "/portal/settings", icon: Settings },
];

export function PortalLayout({ children, requiredRole = "any" }: PortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasAccess, isLoading: roleLoading, role, isAdmin, isEditor, isContributor } = useHasEditorialAccess();

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
    navigate("/portal");
    return null;
  }

  // Check if user has any valid role
  const hasValidRole = isAdmin || isEditor || isContributor;
  
  if (!hasValidRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Pending Role Assignment</h1>
          <p className="text-muted-foreground mb-6">
            Your account has been created but you haven't been assigned a role yet. 
            Please contact an administrator to get access to the portal.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => signOut()} variant="outline">
              Sign Out
            </Button>
            <Button onClick={() => navigate("/")}>
              Return to Site
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check specific role requirement
  if (requiredRole !== "any") {
    const hasRequiredRole = 
      requiredRole === "admin" ? isAdmin :
      requiredRole === "editor" ? (isAdmin || isEditor) :
      requiredRole === "contributor" ? hasValidRole : false;
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this section.
            </p>
            <Button onClick={() => navigate(`/portal/${role}`)} variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go to Your Dashboard
            </Button>
          </div>
        </div>
      );
    }
  }

  const navigation = isAdmin ? adminNavigation : isEditor ? editorNavigation : contributorNavigation;
  const panelTitle = isAdmin ? "Admin Panel" : isEditor ? "Editor Panel" : "Contributor Panel";

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal");
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "admin": return "destructive";
      case "editor": return "default";
      case "contributor": return "secondary";
      default: return "outline";
    }
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
          <div className="flex items-center gap-2 mt-4">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{panelTitle}</h1>
          </div>
          <Badge variant={getRoleBadgeVariant(role)} className="mt-2 capitalize">
            {role}
          </Badge>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
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
