import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { planId, billingPeriod, userId, email, billingDetails } = await req.json();
    
    console.log("Processing subscription:", { planId, billingPeriod, userId, email });

    if (!userId || !planId || !billingPeriod) {
      throw new Error("Missing required fields: userId, planId, billingPeriod");
    }

    // Calculate subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    
    if (billingPeriod === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Check if user already has a subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          billing_period: billingPeriod,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existingSub.id);

      if (updateError) {
        console.error("Failed to update subscription:", updateError);
        throw new Error("Failed to update subscription");
      }

      console.log("Subscription updated successfully");
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          billing_period: billingPeriod,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });

      if (insertError) {
        console.error("Failed to create subscription:", insertError);
        throw new Error("Failed to create subscription");
      }

      console.log("Subscription created successfully");
    }

    // Log billing details for record keeping (would integrate with real payment processor)
    console.log("Billing details stored:", {
      email,
      ...billingDetails,
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Subscription activated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: unknown) {
    console.error("Error processing subscription:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
