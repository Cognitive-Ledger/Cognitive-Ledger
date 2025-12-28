import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Zap, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  billing_period: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

const planDetails: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
  insider: { 
    name: "Insider", 
    icon: <Zap className="h-5 w-5" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-200"
  },
  professional: { 
    name: "Professional", 
    icon: <Crown className="h-5 w-5" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-200"
  },
};

export function SubscriptionStatus() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Sign in to view your subscription status.
          </p>
          <Link to="/auth">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            You don't have an active subscription yet.
          </p>
          <Link to="/subscribe">
            <Button size="sm">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const plan = planDetails[subscription.plan_id] || { 
    name: subscription.plan_id, 
    icon: <Zap className="h-5 w-5" />,
    color: "bg-muted"
  };

  const isActive = subscription.status === "active";
  const periodEnd = new Date(subscription.current_period_end);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription Status</CardTitle>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500/10 text-green-600 border-green-200" : ""}
          >
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Info */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${plan.color}`}>
          {plan.icon}
          <div>
            <p className="font-semibold">{plan.name} Plan</p>
            <p className="text-xs opacity-70 capitalize">{subscription.billing_period} billing</p>
          </div>
        </div>

        {/* Billing Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Current period ends: {format(periodEnd, "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Member since: {format(new Date(subscription.created_at), "MMMM d, yyyy")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link to="/subscribe">
            <Button variant="outline" size="sm">
              Manage Plan
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ExternalLink className="h-4 w-4 mr-1" />
            Billing Portal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
