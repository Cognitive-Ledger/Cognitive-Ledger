import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export default function PortalAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user } = useAuth();
  const { hasAccess, role, isLoading: roleLoading } = useHasEditorialAccess();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in with access
  if (user && !roleLoading) {
    if (hasAccess || role === "contributor") {
      const redirectPath = role === "admin" ? "/portal/admin" : 
                          role === "editor" ? "/portal/editor" : 
                          "/portal/contributor";
      navigate(redirectPath);
      return null;
    }
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Account created",
            description: "Your account has been created. An admin will assign your role.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          throw error;
        }
        toast({
          title: "Welcome back",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Staff Portal | Cognitive Ledger</title>
        <meta name="description" content="Staff portal for Cognitive Ledger team members" />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden bg-[#111111] text-[#FAFAF7]">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FAFAF7 1px, transparent 1px), linear-gradient(to bottom, #FAFAF7 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />
          <div
            className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #223344 0%, transparent 70%)" }}
            aria-hidden
          />

          <div className="relative max-w-md w-full">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 border border-[#FAFAF7]/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FAFAF7]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-serif text-lg leading-none tracking-tight">Cognitive Ledger</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#FAFAF7]/50 mt-1">
                  Staff Portal
                </p>
              </div>
            </div>

            <p className="text-[11px] uppercase tracking-[0.25em] text-[#FAFAF7]/50 mb-6">
              Editorial Access — Est. 2025
            </p>
            <h2 className="font-serif text-5xl leading-[1.05] tracking-tight mb-6">
              The newsroom<br />behind the record.
            </h2>
            <div className="h-px w-16 bg-[#FAFAF7]/30 mb-6" />
            <p className="text-[#FAFAF7]/70 leading-relaxed text-[15px] mb-14 max-w-sm">
              A private workspace for the writers, editors, and stewards shaping
              Cognitive Ledger's coverage of artificial intelligence.
            </p>

            <div className="border-t border-[#FAFAF7]/15">
              {[
                { role: "Administrators", detail: "Full editorial and operational oversight" },
                { role: "Editors", detail: "Review, refine, and publish reporting" },
                { role: "Contributors", detail: "Submit drafts and original research" },
              ].map((item) => (
                <div
                  key={item.role}
                  className="flex items-baseline justify-between py-4 border-b border-[#FAFAF7]/15"
                >
                  <span className="font-serif text-base">{item.role}</span>
                  <span className="text-xs text-[#FAFAF7]/50 text-right ml-6">{item.detail}</span>
                </div>
              ))}
            </div>

            <p className="mt-14 text-[11px] uppercase tracking-[0.2em] text-[#FAFAF7]/40">
              Authorized personnel only
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <Shield className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Cognitive Ledger</h1>
                <p className="text-sm text-muted-foreground">Staff Portal</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isSignUp 
                ? "Register to join the team. An admin will assign your role." 
                : "Enter your credentials to access the portal"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@company.com"
                  className={errors.email ? "border-destructive" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={errors.password ? "border-destructive" : ""}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Need an account? Register"}
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-border text-center">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to main site
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
