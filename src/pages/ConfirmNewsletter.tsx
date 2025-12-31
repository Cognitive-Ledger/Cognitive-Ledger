import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Home, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ConfirmStatus = "loading" | "success" | "error" | "already_confirmed";

export default function ConfirmNewsletter() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("newsletter-confirm", {
          body: { token },
        });

        if (error) throw error;

        if (data?.alreadyConfirmed) {
          setStatus("already_confirmed");
        } else {
          setStatus("success");
        }
      } catch (error) {
        console.error("Confirm error:", error);
        setStatus("error");
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <CardTitle>Confirming your subscription...</CardTitle>
                <CardDescription>Please wait while we verify your email</CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-green-500/10 rounded-full w-fit">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Email Confirmed!</CardTitle>
                <CardDescription>
                  You're now subscribed to The Intelligence Age newsletter. Check your inbox for a welcome email!
                </CardDescription>
              </>
            )}

            {status === "already_confirmed" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
                  <MailCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>Already Confirmed</CardTitle>
                <CardDescription>
                  Your email was already confirmed. You're all set to receive our newsletter!
                </CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-destructive/10 rounded-full w-fit">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle>Invalid Link</CardTitle>
                <CardDescription>
                  This confirmation link is invalid or has expired. Please try subscribing again.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="text-center">
            {status !== "loading" && (
              <Button asChild className="w-full">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
