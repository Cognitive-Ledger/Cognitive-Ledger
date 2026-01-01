import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const MUX_TOKEN_ID = Deno.env.get("MUX_TOKEN_ID");
    const MUX_TOKEN_SECRET = Deno.env.get("MUX_TOKEN_SECRET");

    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      console.error("Missing Mux credentials");
      return new Response(
        JSON.stringify({ error: "Mux credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Basic Auth header
    const credentials = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`);

    console.log("Creating Mux live stream...");

    // Create a live stream via Mux API
    const muxResponse = await fetch("https://api.mux.com/video/v1/live-streams", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playback_policy: ["public"],
        new_asset_settings: {
          playback_policy: ["public"],
        },
        reduced_latency: true,
      }),
    });

    if (!muxResponse.ok) {
      const errorText = await muxResponse.text();
      console.error("Mux API error:", muxResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create Mux live stream", details: errorText }),
        { status: muxResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const muxData = await muxResponse.json();
    const liveStream = muxData.data;

    console.log("Mux live stream created:", liveStream.id);

    // Extract the stream key and playback URL
    const streamKey = liveStream.stream_key;
    const playbackId = liveStream.playback_ids?.[0]?.id;
    const playbackUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;
    const rtmpUrl = "rtmps://global-live.mux.com:443/app";

    return new Response(
      JSON.stringify({
        stream_key: streamKey,
        playback_url: playbackUrl,
        rtmp_url: rtmpUrl,
        mux_live_stream_id: liveStream.id,
        playback_id: playbackId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error creating Mux stream:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
