import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs for Creem.io - these would be configured in your Creem dashboard
const PRODUCTS = {
  insider_monthly: "prod_insider_monthly",
  insider_annual: "prod_insider_annual",
  professional_monthly: "prod_professional_monthly",
  professional_annual: "prod_professional_annual",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CREEM_API_KEY = Deno.env.get("CREEM_API_KEY");
    if (!CREEM_API_KEY) {
      throw new Error("CREEM_API_KEY not configured. Please add your Creem.io API key.");
    }

    const CREEM_API_URL = "https://api.creem.io/v1";

    const { planId, isAnnual, email, userId } = await req.json();
    console.log("Creating checkout:", { planId, isAnnual, email, userId });

    // Determine product ID based on plan and billing period
    const productKey = `${planId}_${isAnnual ? "annual" : "monthly"}` as keyof typeof PRODUCTS;
    const productId = PRODUCTS[productKey];

    if (!productId) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    // Create checkout session with Creem
    const response = await fetch(`${CREEM_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "x-api-key": CREEM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        customer: { email },
        metadata: {
          user_id: userId,
          plan_id: planId,
          billing_period: isAnnual ? "annual" : "monthly",
        },
        success_url: `${req.headers.get("origin")}/subscription/success`,
        cancel_url: `${req.headers.get("origin")}/subscription/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Creem API error:", error);
      throw new Error("Failed to create checkout session");
    }

    const data = await response.json();
    console.log("Checkout created:", data);

    return new Response(JSON.stringify({ 
      checkoutUrl: data.checkout_url || data.url,
      sessionId: data.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error creating checkout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
