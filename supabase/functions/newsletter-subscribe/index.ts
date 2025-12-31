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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active, confirmed_at, confirmation_token")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    let confirmationToken: string;

    if (existing) {
      if (existing.is_active && existing.confirmed_at) {
        console.log("Email already subscribed and confirmed:", email);
        return new Response(
          JSON.stringify({ message: "You're already subscribed!", alreadySubscribed: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else if (!existing.confirmed_at) {
        // Resend confirmation email
        confirmationToken = existing.confirmation_token;
        console.log("Resending confirmation for:", email);
      } else {
        // Reactivate subscription - generate new token
        const newToken = crypto.randomUUID();
        await supabase
          .from("newsletter_subscribers")
          .update({ 
            is_active: false, 
            unsubscribed_at: null,
            confirmed_at: null,
            confirmation_token: newToken
          })
          .eq("id", existing.id);
        confirmationToken = newToken;
        console.log("Reactivation pending confirmation for:", email);
      }
    } else {
      // Insert new subscriber with pending confirmation
      const newToken = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ 
          email: email.toLowerCase(),
          is_active: false,
          confirmation_token: newToken
        });

      if (insertError) {
        console.error("Error inserting subscriber:", insertError);
        throw new Error("Failed to save subscription");
      }
      confirmationToken = newToken;
      console.log("New subscriber pending confirmation:", email);
    }

    // Send confirmation email
    const siteUrl = Deno.env.get("SITE_URL") || "https://ibabjqkkzypvjoiixnaz.lovableproject.com";
    const confirmUrl = `${siteUrl}/confirm-newsletter?token=${confirmationToken}`;

    const emailResponse = await resend.emails.send({
      from: "The Intelligence Age <newsletter@resend.dev>",
      to: [email],
      subject: "Confirm your subscription to The Intelligence Age",
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
            <h2 style="margin-top: 0;">Confirm your subscription</h2>
            <p>Thanks for signing up! Please confirm your email address to start receiving our newsletter.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Confirm Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${confirmUrl}</p>
          </div>
          
          <div style="text-align: center; color: #888; font-size: 12px;">
            <p>If you didn't sign up for this newsletter, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Please check your email to confirm your subscription!" }),
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
