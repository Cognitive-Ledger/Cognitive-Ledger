import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs for Autumn - configure these in your Autumn dashboard
const PRODUCTS = {
  insider_monthly: "insider_monthly",
  insider_annual: "insider_annual",
  professional_monthly: "professional_monthly",
  professional_annual: "professional_annual",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AUTUMN_SECRET_KEY = Deno.env.get("AUTUMN_SECRET_KEY");
    if (!AUTUMN_SECRET_KEY) {
      throw new Error("AUTUMN_SECRET_KEY not configured");
    }

    const { planId, isAnnual, email, userId } = await req.json();
    console.log("Creating Autumn checkout:", { planId, isAnnual, email, userId });

    // Determine product ID based on plan and billing period
    const productKey = `${planId}_${isAnnual ? "annual" : "monthly"}` as keyof typeof PRODUCTS;
    const productId = PRODUCTS[productKey];

    if (!productId) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    const origin = req.headers.get("origin") || "https://cognitive-ledger.lovable.app";

    // Create or get customer in Autumn
    const customerResponse = await fetch("https://api.useautumn.com/v1/customers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AUTUMN_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        email: email,
        name: email.split("@")[0],
      }),
    });

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error("Autumn customer error:", errorText);
      // Continue anyway - customer might already exist
    } else {
      const customerData = await customerResponse.json();
      console.log("Autumn customer created/found:", customerData);
    }

    // Attach product to customer (this triggers checkout)
    const attachResponse = await fetch("https://api.useautumn.com/v1/attach", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AUTUMN_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: userId,
        product_id: productId,
        success_url: `${origin}/subscribe?success=true`,
        cancel_url: `${origin}/subscribe?canceled=true`,
      }),
    });

    if (!attachResponse.ok) {
      const errorText = await attachResponse.text();
      console.error("Autumn attach error:", errorText);
      throw new Error("Failed to create checkout session");
    }

    const attachData = await attachResponse.json();
    console.log("Autumn attach response:", attachData);

    // If checkout URL is provided, redirect there
    if (attachData.checkout_url) {
      return new Response(JSON.stringify({ 
        checkoutUrl: attachData.checkout_url,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If product was attached directly (free trial or already subscribed)
    if (attachData.code === "updated_product_successfully") {
      return new Response(JSON.stringify({ 
        success: true,
        message: attachData.message,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      checkoutUrl: attachData.url || attachData.checkout_url,
      data: attachData,
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
