import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        console.log("Email already subscribed:", email);
        return new Response(
          JSON.stringify({ message: "You're already subscribed!", alreadySubscribed: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, unsubscribed_at: null })
          .eq("id", existing.id);
        console.log("Reactivated subscription for:", email);
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase() });

      if (insertError) {
        console.error("Error inserting subscriber:", insertError);
        throw new Error("Failed to save subscription");
      }
      console.log("New subscriber added:", email);
    }

    // Get the site URL for unsubscribe link
    const siteUrl = Deno.env.get("SITE_URL") || "https://ibabjqkkzypvjoiixnaz.lovableproject.com";
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "The Intelligence Age <newsletter@resend.dev>",
      to: [email],
      subject: "Welcome to The Intelligence Age Newsletter! 🤖",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Georgia, serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin-bottom: 10px;">The Intelligence Age</h1>
            <p style="color: #666; font-size: 14px;">Your weekly AI briefing</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f8f8f8 0%, #fff 100%); border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">Welcome aboard! 🎉</h2>
            <p>Thank you for subscribing to The Intelligence Age newsletter.</p>
            <p>Every week, you'll receive:</p>
            <ul style="padding-left: 20px;">
              <li>The most important AI developments</li>
              <li>In-depth analysis and insights</li>
              <li>Exclusive content and early access</li>
            </ul>
            <p>Stay ahead of the curve in the rapidly evolving world of artificial intelligence.</p>
          </div>
          
          <div style="text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            <p>You received this email because you subscribed to The Intelligence Age newsletter.</p>
            <p><a href="${unsubscribeUrl}" style="color: #888; text-decoration: underline;">Unsubscribe</a></p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in newsletter-subscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
