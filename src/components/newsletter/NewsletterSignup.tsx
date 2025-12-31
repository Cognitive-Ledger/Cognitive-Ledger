import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "footer";
  className?: string;
}

export function NewsletterSignup({ variant = "card", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: email.trim() },
      });

      if (error) throw error;

      setIsSuccess(true);
      setEmail("");
      
      if (data?.alreadySubscribed) {
        toast.info("You're already subscribed!");
      } else {
        toast.success("You're subscribed! Check your inbox for a welcome email.");
      }
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1"
          required
        />
        <Button type="submit" disabled={isSubmitting || isSuccess}>
          {isSuccess ? <CheckCircle className="h-4 w-4" /> : isSubmitting ? "..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  if (variant === "footer") {
    return (
      <div className={className}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-caption mb-3">
          Newsletter
        </h3>
        <p className="text-sm text-body-text mb-4">
          Get AI news delivered to your inbox weekly.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-background"
            required
          />
          <Button type="submit" size="sm" className="w-full" disabled={isSubmitting || isSuccess}>
            {isSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Subscribed!
              </>
            ) : isSubmitting ? (
              "Subscribing..."
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 rounded-lg p-6 ${className}`}>
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-headline">
            Stay Informed
          </h3>
        </div>
        
        <p className="text-sm text-body-text mb-4 leading-relaxed">
          Get the most important AI developments delivered to your inbox every week. No spam, unsubscribe anytime.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="bg-background"
            required
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isSuccess}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                You're on the list!
              </>
            ) : isSubmitting ? (
              "Subscribing..."
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe to Newsletter
              </>
            )}
          </Button>
        </form>
        
        <p className="text-xs text-caption mt-3 text-center">
          Join 10,000+ readers. Free forever.
        </p>
      </div>
    </div>
  );
}
