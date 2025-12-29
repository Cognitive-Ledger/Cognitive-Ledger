import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Lock, 
  Zap, 
  Crown, 
  Check, 
  Loader2,
  ArrowLeft,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "insider",
    name: "Insider",
    monthlyPrice: 10,
    annualPrice: 100,
    description: "Essential access to premium AI journalism",
    icon: <Zap className="h-5 w-5" />,
    features: [
      "Unlimited article access",
      "Daily AI briefing email",
      "Ad-free reading experience",
      "Weekly podcast episodes",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 20,
    annualPrice: 200,
    description: "For professionals who need comprehensive AI coverage",
    icon: <Crown className="h-5 w-5" />,
    features: [
      "Everything in Insider",
      "Live streams & expert Q&As",
      "Exclusive research reports",
      "API access to AI Index",
    ],
  },
];

const cardSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Use MM/YY format"),
  cvv: z.string().min(3, "CVV must be 3-4 digits").max(4),
  cardholderName: z.string().min(2, "Name is required"),
});

const billingSchema = z.object({
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const planId = searchParams.get("plan") || "professional";
  const isAnnual = searchParams.get("billing") === "annual";
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  
  // Billing details
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const plan = plans.find(p => p.id === planId) || plans[1];
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/checkout?" + searchParams.toString());
    }
  }, [user, authLoading, navigate, searchParams]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : "";
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return digits.substring(0, 2) + "/" + digits.substring(2, 4);
    }
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate card
    const cardResult = cardSchema.safeParse({
      cardNumber: cardNumber.replace(/\s/g, ""),
      expiryDate,
      cvv,
      cardholderName,
    });

    // Validate billing
    const billingResult = billingSchema.safeParse({
      email,
      fullName,
      address,
      city,
      postalCode,
      country,
    });

    const newErrors: Record<string, string> = {};
    
    if (!cardResult.success) {
      cardResult.error.errors.forEach(err => {
        newErrors[err.path[0] as string] = err.message;
      });
    }
    
    if (!billingResult.success) {
      billingResult.error.errors.forEach(err => {
        newErrors[err.path[0] as string] = err.message;
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-subscription", {
        body: {
          planId: plan.id,
          billingPeriod: isAnnual ? "annual" : "monthly",
          userId: user?.id,
          email,
          billingDetails: {
            fullName,
            address,
            city,
            postalCode,
            country,
          },
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Subscription activated!",
          description: `Welcome to ${plan.name}. Your subscription is now active.`,
        });
        navigate("/subscribe?success=true");
      } else {
        throw new Error(data?.error || "Failed to process subscription");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout — Cognitive Ledger</title>
        <meta name="description" content="Complete your subscription to Cognitive Ledger." />
      </Helmet>

      <Layout>
        <div className="container py-8 max-w-5xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/subscribe")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to plans
          </Button>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Details */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          className={errors.cardNumber ? "border-destructive" : ""}
                        />
                        {errors.cardNumber && (
                          <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                            maxLength={5}
                            className={errors.expiryDate ? "border-destructive" : ""}
                          />
                          {errors.expiryDate && (
                            <p className="text-xs text-destructive mt-1">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                            maxLength={4}
                            type="password"
                            className={errors.cvv ? "border-destructive" : ""}
                          />
                          {errors.cvv && (
                            <p className="text-xs text-destructive mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Doe"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          className={errors.cardholderName ? "border-destructive" : ""}
                        />
                        {errors.cardholderName && (
                          <p className="text-xs text-destructive mt-1">{errors.cardholderName}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Billing Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Billing Information</h3>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive mt-1">{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={errors.fullName ? "border-destructive" : ""}
                          />
                          {errors.fullName && (
                            <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Main St"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={errors.address ? "border-destructive" : ""}
                        />
                        {errors.address && (
                          <p className="text-xs text-destructive mt-1">{errors.address}</p>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={errors.city ? "border-destructive" : ""}
                          />
                          {errors.city && (
                            <p className="text-xs text-destructive mt-1">{errors.city}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            placeholder="10001"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className={errors.postalCode ? "border-destructive" : ""}
                          />
                          {errors.postalCode && (
                            <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="United States"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={errors.country ? "border-destructive" : ""}
                          />
                          {errors.country && (
                            <p className="text-xs text-destructive mt-1">{errors.country}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Pay ${price} {isAnnual ? "/year" : "/month"}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      Your payment is secure and encrypted
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plan */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                      {plan.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <Badge variant="secondary">
                          {isAnnual ? "Annual" : "Monthly"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${price}</span>
                    </div>
                    {isAnnual && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Annual savings</span>
                        <span>-${plan.monthlyPrice * 12 - plan.annualPrice}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${price}{isAnnual ? "/year" : "/month"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Cancel anytime • 7-day free trial
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
