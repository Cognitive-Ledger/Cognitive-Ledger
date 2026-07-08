import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Headphones, 
  Radio, 
  Bookmark, 
  Mail, 
  Zap, 
  Crown,
  Sparkles,
  Loader2,
  Bell,
  Newspaper,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: "insider",
    name: "Insider",
    monthlyPrice: 10,
    annualPrice: 100,
    description: "Essential access to premium AI journalism",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Unlimited article access",
      "Daily AI briefing email",
      "Ad-free reading experience",
      "Weekly podcast episodes",
      "Save articles for offline",
      "Early access to reports",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 20,
    annualPrice: 200,
    description: "For professionals who need comprehensive AI coverage",
    icon: <Crown className="h-6 w-6" />,
    badge: "Most Popular",
    highlighted: true,
    features: [
      "Everything in Insider",
      "Live streams & expert Q&As",
      "Exclusive research reports",
      "API access to AI Index",
      "Priority event access",
      "Monthly industry analysis",
      "Custom news alerts",
      "Team sharing (up to 3)",
    ],
  },
];

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch notification preferences
  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe",
      });
      navigate("/auth?redirect=/subscribe");
      return;
    }

    // Navigate to custom checkout page
    navigate(`/checkout?plan=${planId}&billing=${isAnnual ? "annual" : "monthly"}`);
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to update preferences",
      });
      return;
    }

    try {
      // Check if preferences exist
      if (!preferences) {
        // Create preferences
        const { error } = await supabase
          .from("notification_preferences")
          .insert({ user_id: user.id, [key]: value } as any);
        if (error) throw error;
      } else {
        // Update preferences
        const { error } = await supabase
          .from("notification_preferences")
          .update({ [key]: value } as any)
          .eq("user_id", user.id);
        if (error) throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast({ title: "Preferences updated" });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (plan: Plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return `$${price}`;
  };

  const getSavingsPercent = (plan: Plan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <>
      <Helmet>
        <title>Subscribe — Cognitive Ledger</title>
        <meta name="description" content="Subscribe to Cognitive Ledger for premium AI news, analysis, live streams, and exclusive content." />
      </Helmet>

      <Layout>
        <div className="container py-12">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium uppercase tracking-widest text-primary">Premium</span>
            </div>
            <h1 className="headline-hero mb-4">Unlock Premium Access</h1>
            <p className="text-xl text-body-text max-w-2xl mx-auto">
              Get the full Cognitive Ledger experience with exclusive content, live streams, and expert analysis.
            </p>
          </header>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-muted rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 text-sm rounded-full transition-colors ${
                  !isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 text-sm rounded-full transition-colors flex items-center gap-2 ${
                  isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Save 17%</Badge>
              </button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-sm">
              <Headphones className="h-5 w-5 text-primary" />
              <span>Weekly Podcasts</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Radio className="h-5 w-5 text-primary" />
              <span>Live Streams</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-5 w-5 text-primary" />
              <span>Exclusive Newsletters</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bookmark className="h-5 w-5 text-primary" />
              <span>Research Reports</span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer transition-all ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-xl scale-[1.02]"
                    : selectedPlan === plan.id
                    ? "border-primary/50"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1">
                    {plan.badge}
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${plan.highlighted ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold">{formatPrice(plan)}</span>
                    <span className="text-muted-foreground">/{isAnnual ? "year" : "month"}</span>
                    {isAnnual && (
                      <p className="text-sm text-green-600 mt-1">
                        Save {getSavingsPercent(plan)}% with annual billing
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubscribe(plan.id);
                    }}
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {plan.highlighted ? "Get Started" : "Choose Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subscription Status */}
          {user && (
            <>
              <Separator className="mb-12" />
              
              <section className="max-w-2xl mx-auto mb-12">
                <SubscriptionStatus />
              </section>
            </>
          )}

          {/* Notification Preferences */}
          {user && (
            <>
              <Separator className="mb-12" />
              
              <section className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="h-6 w-6 text-primary" />
                  <h2 className="headline-secondary">Notification Preferences</h2>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    {prefsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Radio className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="live_streams" className="font-medium">Live Streams</Label>
                              <p className="text-sm text-muted-foreground">Get notified when streams go live</p>
                            </div>
                          </div>
                          <Switch
                            id="live_streams"
                            checked={preferences?.live_streams ?? true}
                            onCheckedChange={(checked) => updatePreference("live_streams", checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Newspaper className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="new_articles" className="font-medium">New Articles</Label>
                              <p className="text-sm text-muted-foreground">Daily digest of new articles</p>
                            </div>
                          </div>
                          <Switch
                            id="new_articles"
                            checked={preferences?.new_articles ?? true}
                            onCheckedChange={(checked) => updatePreference("new_articles", checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="newsletters" className="font-medium">Newsletters</Label>
                              <p className="text-sm text-muted-foreground">Weekly AI industry newsletter</p>
                            </div>
                          </div>
                          <Switch
                            id="newsletters"
                            checked={preferences?.newsletters ?? true}
                            onCheckedChange={(checked) => updatePreference("newsletters", checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-primary" />
                            <div>
                              <Label htmlFor="product_updates" className="font-medium">Product Updates</Label>
                              <p className="text-sm text-muted-foreground">New features and improvements</p>
                            </div>
                          </div>
                          <Switch
                            id="product_updates"
                            checked={preferences?.product_updates ?? false}
                            onCheckedChange={(checked) => updatePreference("product_updates", checked)}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </section>
            </>
          )}

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>Cancel anytime • 7-day free trial on all plans • Secure payment</p>
          </div>
        </div>
      </Layout>
    </>
  );
}
