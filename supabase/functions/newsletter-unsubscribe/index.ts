import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UnsubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: UnsubscribeRequest = await req.json();

    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find subscriber
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (findError) {
      console.error("Error finding subscriber:", findError);
      throw new Error("Failed to process unsubscribe request");
    }

    if (!subscriber) {
      console.log("Subscriber not found:", email);
      return new Response(
        JSON.stringify({ success: true, alreadyUnsubscribed: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscriber.is_active) {
      console.log("Already unsubscribed:", email);
      return new Response(
        JSON.stringify({ success: true, alreadyUnsubscribed: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update subscriber to inactive
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error updating subscriber:", updateError);
      throw new Error("Failed to unsubscribe");
    }

    console.log("Successfully unsubscribed:", email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in newsletter-unsubscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
