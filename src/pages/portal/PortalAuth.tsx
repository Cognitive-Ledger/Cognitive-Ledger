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
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-12 h-12 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cognitive Ledger</h1>
                <p className="text-sm text-muted-foreground">Staff Portal</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Welcome to the Editorial Hub
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Access your dashboard to manage content, review submissions, and collaborate with your team. 
              This portal is exclusively for Cognitive Ledger staff members.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">Admin</p>
                <p className="text-xs text-muted-foreground">Full access</p>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">Editor</p>
                <p className="text-xs text-muted-foreground">Edit & publish</p>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">Contributor</p>
                <p className="text-xs text-muted-foreground">Submit content</p>
              </div>
            </div>
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
