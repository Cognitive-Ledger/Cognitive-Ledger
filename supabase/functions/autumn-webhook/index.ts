import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AUTUMN_SECRET_KEY = Deno.env.get("AUTUMN_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!AUTUMN_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log("Autumn webhook received:", JSON.stringify(body, null, 2));

    const { type, data } = body;

    // Handle different event types
    switch (type) {
      case "subscription.created":
      case "customer.subscription.created": {
        console.log("Processing subscription.created event");
        const subscription = data.subscription || data;
        const customer = data.customer || {};
        
        // Extract relevant data
        const userId = customer.id || subscription.customer_id;
        const planId = extractPlanId(subscription.product_id || subscription.items?.[0]?.product_id);
        const isAnnual = (subscription.product_id || "").includes("annual") || 
                         subscription.billing_period === "annual";
        
        // Calculate period dates
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + (isAnnual ? 12 : 1));

        const { error: insertError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: "active",
            billing_period: isAnnual ? "annual" : "monthly",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            autumn_customer_id: customer.id || null,
            autumn_subscription_id: subscription.id || null,
          }, { onConflict: "user_id" });

        if (insertError) {
          console.error("Error inserting subscription:", insertError);
          throw insertError;
        }
        
        console.log("Subscription created successfully for user:", userId);
        break;
      }

      case "payment.succeeded":
      case "invoice.paid": {
        console.log("Processing payment.succeeded event");
        const payment = data.payment || data;
        const customerId = payment.customer_id || data.customer?.id;
        
        if (customerId) {
          // Update subscription status to active if it was past_due
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({ 
              status: "active",
              updated_at: new Date().toISOString()
            })
            .eq("autumn_customer_id", customerId)
            .eq("status", "past_due");

          if (updateError) {
            console.error("Error updating subscription after payment:", updateError);
          } else {
            console.log("Payment processed for customer:", customerId);
          }
        }
        break;
      }

      case "subscription.canceled":
      case "customer.subscription.deleted": {
        console.log("Processing subscription.canceled event");
        const subscription = data.subscription || data;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer_id || data.customer?.id;
        
        // Try to find by subscription ID first, then by customer ID
        let updateQuery = supabase
          .from("subscriptions")
          .update({ 
            status: "canceled",
            updated_at: new Date().toISOString()
          });

        if (subscriptionId) {
          updateQuery = updateQuery.eq("autumn_subscription_id", subscriptionId);
        } else if (customerId) {
          updateQuery = updateQuery.eq("autumn_customer_id", customerId);
        }

        const { error: cancelError } = await updateQuery;

        if (cancelError) {
          console.error("Error canceling subscription:", cancelError);
          throw cancelError;
        }
        
        console.log("Subscription canceled:", subscriptionId || customerId);
        break;
      }

      case "subscription.updated": {
        console.log("Processing subscription.updated event");
        const subscription = data.subscription || data;
        const subscriptionId = subscription.id;
        
        const planId = extractPlanId(subscription.product_id);
        const isAnnual = (subscription.product_id || "").includes("annual");
        
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ 
            plan_id: planId,
            billing_period: isAnnual ? "annual" : "monthly",
            status: subscription.status || "active",
            updated_at: new Date().toISOString()
          })
          .eq("autumn_subscription_id", subscriptionId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw updateError;
        }
        
        console.log("Subscription updated:", subscriptionId);
        break;
      }

      case "payment.failed":
      case "invoice.payment_failed": {
        console.log("Processing payment.failed event");
        const payment = data.payment || data;
        const customerId = payment.customer_id || data.customer?.id;
        
        if (customerId) {
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({ 
              status: "past_due",
              updated_at: new Date().toISOString()
            })
            .eq("autumn_customer_id", customerId);

          if (updateError) {
            console.error("Error updating subscription after failed payment:", updateError);
          } else {
            console.log("Marked subscription as past_due for customer:", customerId);
          }
        }
        break;
      }

      default:
        console.log("Unhandled event type:", type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper to extract clean plan ID from product ID
function extractPlanId(productId: string | undefined): string {
  if (!productId) return "insider";
  
  // Remove _monthly or _annual suffix
  const cleanId = productId.replace(/_monthly$/, "").replace(/_annual$/, "");
  return cleanId;
}
