import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StreamNotificationRequest {
  streamId: string;
  streamTitle: string;
  streamDescription: string;
  scheduledAt: string;
  notificationType: "scheduled" | "live";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { streamId, streamTitle, streamDescription, scheduledAt, notificationType }: StreamNotificationRequest = await req.json();
    
    console.log("Sending stream notification:", { streamId, streamTitle, notificationType });

    // Create Supabase client to get subscriber emails
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all user emails from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const subscriberEmails = profiles?.map(p => p.email).filter(Boolean) || [];
    
    if (subscriberEmails.length === 0) {
      console.log("No subscribers to notify");
      return new Response(JSON.stringify({ message: "No subscribers to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const formattedDate = new Date(scheduledAt).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const isLive = notificationType === "live";
    const subject = isLive 
      ? `🔴 NOW LIVE: ${streamTitle}` 
      : `📅 New Stream Scheduled: ${streamTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            ${isLive ? `
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; text-align: center;">
                <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin-bottom: 16px;">
                  <span style="color: white; font-weight: bold; font-size: 14px;">🔴 LIVE NOW</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 24px;">${streamTitle}</h1>
              </div>
            ` : `
              <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 24px; text-align: center;">
                <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; margin-bottom: 16px;">
                  <span style="color: white; font-weight: bold; font-size: 14px;">📅 NEW STREAM</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 24px;">${streamTitle}</h1>
              </div>
            `}
            
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                ${streamDescription}
              </p>
              
              ${!isLive ? `
                <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Scheduled for</p>
                  <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">${formattedDate}</p>
                </div>
              ` : ''}
              
              <a href="${Deno.env.get("SITE_URL") || "https://cognitivyledger.lovable.app"}/live" 
                 style="display: block; background: ${isLive ? '#ef4444' : '#6366f1'}; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; text-align: center; font-size: 16px;">
                ${isLive ? 'Watch Now →' : 'Set Reminder'}
              </a>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Cognitive Ledger — AI News & Analysis
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0;">
                You're receiving this because you subscribed to stream notifications.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails in batches (Resend has a limit)
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < subscriberEmails.length; i += batchSize) {
      const batch = subscriberEmails.slice(i, i + batchSize);
      
      const emailResponse = await resend.emails.send({
        from: "Cognitive Ledger <notifications@resend.dev>",
        to: batch,
        subject,
        html,
      });
      
      results.push(emailResponse);
      console.log(`Batch ${Math.floor(i / batchSize) + 1} sent:`, emailResponse);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent: subscriberEmails.length,
      results 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: unknown) {
    console.error("Error sending stream notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
