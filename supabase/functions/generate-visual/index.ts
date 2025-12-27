import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { type, description, articleContext } = await req.json();
    console.log("Generating visual:", { type, description, articleContext: articleContext?.slice(0, 100) });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    if (type === "chart" || type === "graph") {
      // Generate chart data using AI
      const prompt = `You are a data analyst. Based on this article context and chart description, generate realistic chart data.

Article context: ${articleContext?.slice(0, 1000) || "General AI technology article"}

Chart description: ${description}

Generate JSON data for a chart. The response must be ONLY valid JSON with this structure:
{
  "chartType": "bar" | "line" | "pie" | "area",
  "title": "Short title for the chart",
  "data": [
    { "name": "Category Name", "value": 50, ... }
  ],
  "xAxisLabel": "Label for X axis",
  "yAxisLabel": "Label for Y axis"
}

For comparison charts, use multiple value keys like "modelA" and "modelB".
For time series, use years or dates as names.
Make the data realistic and relevant to AI/technology topics.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("AI API error:", error);
        throw new Error("Failed to generate chart data");
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content || "{}";
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const chartData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      return new Response(JSON.stringify({ type: "chart", data: chartData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "diagram") {
      // Generate diagram steps using AI
      const prompt = `Based on this description, generate a flow diagram with 4-6 steps.

Description: ${description}
Article context: ${articleContext?.slice(0, 500) || "General AI technology article"}

Respond ONLY with valid JSON:
{
  "title": "Diagram title",
  "steps": ["Step 1 description", "Step 2 description", ...]
}

Make the steps relevant to AI/ML concepts and technically accurate.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate diagram");
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content || "{}";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const diagramData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      return new Response(JSON.stringify({ type: "diagram", data: diagramData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "image") {
      // Generate image using Gemini image model
      const imagePrompt = `A professional, high-quality illustration for an AI technology article: ${description}. Modern, clean, tech-focused design. Photorealistic style.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Image generation error:", error);
        // Fallback to a relevant Unsplash image
        const keywords = description.toLowerCase();
        let query = "artificial+intelligence";
        if (keywords.includes("robot")) query = "robot+technology";
        else if (keywords.includes("chip") || keywords.includes("hardware")) query = "computer+chip";
        else if (keywords.includes("data")) query = "data+visualization";
        else if (keywords.includes("brain") || keywords.includes("neural")) query = "brain+neural";
        
        return new Response(JSON.stringify({ 
          type: "image", 
          data: { 
            url: `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=${encodeURIComponent(query)}`,
            alt: description
          } 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await response.json();
      const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      return new Response(JSON.stringify({ 
        type: "image", 
        data: { url: imageUrl, alt: description } 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown visual type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error generating visual:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
