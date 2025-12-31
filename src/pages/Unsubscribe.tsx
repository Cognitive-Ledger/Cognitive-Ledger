import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Home, MailX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type UnsubscribeStatus = "loading" | "success" | "error" | "already_unsubscribed";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const email = searchParams.get("email");

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", {
          body: { email },
        });

        if (error) throw error;

        if (data?.alreadyUnsubscribed) {
          setStatus("already_unsubscribed");
        } else {
          setStatus("success");
        }
      } catch (error) {
        console.error("Unsubscribe error:", error);
        setStatus("error");
      }
    };

    unsubscribe();
  }, [email]);

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
                <CardTitle>Processing...</CardTitle>
                <CardDescription>Please wait while we update your preferences</CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-green-500/10 rounded-full w-fit">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>You've been unsubscribed</CardTitle>
                <CardDescription>
                  You will no longer receive newsletter emails from us.
                </CardDescription>
              </>
            )}

            {status === "already_unsubscribed" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-muted rounded-full w-fit">
                  <MailX className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>Already unsubscribed</CardTitle>
                <CardDescription>
                  This email is not currently subscribed to our newsletter.
                </CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-4 p-4 bg-destructive/10 rounded-full w-fit">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>
                  We couldn't process your request. Please try again later or contact support.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="text-center space-y-4">
            {status !== "loading" && (
              <>
                <Button asChild className="w-full">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Return to Homepage
                  </Link>
                </Button>
                
                {(status === "success" || status === "already_unsubscribed") && (
                  <p className="text-sm text-muted-foreground">
                    Changed your mind?{" "}
                    <Link to="/" className="text-primary hover:underline">
                      Subscribe again
                    </Link>
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
