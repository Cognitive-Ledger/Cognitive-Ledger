import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Headphones, 
  Radio, 
  Bookmark, 
  Mail, 
  Zap, 
  Crown,
  Sparkles,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("creem-checkout", {
        body: {
          planId,
          isAnnual,
          email: user?.email || "",
          userId: user?.id || "",
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast({
        title: "Payment Coming Soon",
        description: `${plan.name} subscription will be available soon. We'll notify you when it launches!`,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-serif flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Unlock Premium Access
              </DialogTitle>
              <DialogDescription className="mt-2">
                Get the full Cognitive Ledger experience with exclusive content and features
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  !isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
                  isAnnual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Save 17%</Badge>
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Featured content preview */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Premium Features Include
          </p>
          <div className="flex gap-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Headphones className="h-4 w-4 text-primary" />
              <span>Weekly Podcasts</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Radio className="h-4 w-4 text-primary" />
              <span>Live Streams</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Mail className="h-4 w-4 text-primary" />
              <span>Exclusive Newsletters</span>
            </div>
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Bookmark className="h-4 w-4 text-primary" />
              <span>Research Reports</span>
            </div>
          </div>
        </div>

        {/* Plans grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                    : selectedPlan === plan.id
                    ? "border-primary/50"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3">
                    {plan.badge}
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${plan.highlighted ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {formatPrice(plan)}
                  </span>
                  <span className="text-muted-foreground">
                    {isAnnual ? "/year" : "/month"}
                  </span>
                  {isAnnual && (
                    <p className="text-xs text-green-600 mt-1">
                      Save {getSavingsPercent(plan)}% with annual billing
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-muted-foreground pl-6">
                      + {plan.features.length - 5} more features
                    </li>
                  )}
                </ul>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(plan.id);
                  }}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {plan.highlighted ? "Get Started" : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30 text-center text-sm text-muted-foreground">
          <p>
            Cancel anytime • 7-day free trial on all plans • Secure payment powered by Creem
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
