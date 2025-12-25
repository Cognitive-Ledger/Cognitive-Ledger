import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AssistAction = 
  | "generate-outline"
  | "expand-section"
  | "simplify"
  | "make-technical"
  | "generate-excerpt"
  | "improve-writing";

function getSystemPrompt(action: AssistAction): string {
  const prompts: Record<AssistAction, string> = {
    "generate-outline": `You are an expert AI/tech news editor. Create a detailed article outline with:
- A compelling headline
- Key sections with bullet points
- Suggested angles and hooks
- Questions to address
Format the outline clearly with markdown headers and bullet points.`,
    
    "expand-section": `You are an expert AI/tech journalist. Expand on the given topic with:
- In-depth analysis and context
- Relevant examples and data points
- Expert perspectives (you can suggest quotes to seek)
- Future implications
Write in a professional, engaging journalism style.`,
    
    "simplify": `You are an expert at explaining complex AI and technology topics to general audiences. Rewrite the content to be:
- Easy to understand for non-technical readers
- Free of jargon (or with jargon explained)
- Engaging and relatable
- Accurate while accessible
Maintain the key information while making it digestible.`,
    
    "make-technical": `You are an expert AI researcher and technical writer. Enhance the content with:
- Technical depth and precision
- Specific metrics, benchmarks, or specifications
- Architecture or methodology details
- Technical implications and edge cases
Write for an audience of developers and researchers.`,
    
    "generate-excerpt": `You are an expert editor. Create a compelling excerpt/summary that:
- Captures the key story in 2-3 sentences
- Hooks the reader to continue
- Includes the most newsworthy element
- Is under 200 characters if possible
Write only the excerpt, nothing else.`,
    
    "improve-writing": `You are an expert editor at a leading tech publication. Improve the writing by:
- Enhancing clarity and flow
- Strengthening the narrative
- Fixing any awkward phrasing
- Making it more engaging
- Correcting any errors
Return the improved version of the text.`,
  };
  
  return prompts[action];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content } = await req.json();

    if (!action || !content) {
      return new Response(
        JSON.stringify({ error: "Missing action or content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getSystemPrompt(action as AssistAction);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Article AI assist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
