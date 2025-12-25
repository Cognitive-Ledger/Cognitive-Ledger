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
  | "improve-writing"
  | "write-article"
  | "deep-research";

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

    "write-article": `You are an expert AI/tech journalist at a leading publication. Write a complete, publication-ready article based on the given topic or prompt. Your article should include:

1. **Compelling Headline**: A clear, engaging title that captures the essence
2. **Lead Paragraph**: Hook the reader with the most important/interesting angle
3. **Body Content**: 
   - Provide thorough coverage of the topic
   - Include relevant context and background
   - Present multiple perspectives where appropriate
   - Use concrete examples and data points
4. **Structure**: Use clear sections with subheadings
5. **Conclusion**: Summarize key takeaways or future outlook

Write in a professional, engaging journalism style. The article should be 800-1500 words and ready for publication.`,

    "deep-research": `You are an expert AI/tech journalist with access to web research. Based on the research content provided, write a comprehensive, well-researched article. Your article should:

1. **Synthesize the Research**: Combine information from multiple sources
2. **Provide Context**: Explain why this matters in the broader tech landscape
3. **Include Data & Facts**: Use specific numbers, dates, and verifiable information
4. **Multiple Perspectives**: Present different viewpoints on the topic
5. **Expert Analysis**: Add your informed analysis based on the research
6. **Proper Attribution**: Reference sources appropriately

Write a publication-ready article of 1000-2000 words with a compelling headline and clear structure.`,
  };
  
  return prompts[action];
}

async function fetchWebContent(query: string): Promise<string> {
  console.log("Fetching web content for query:", query);
  
  // Use multiple search URLs to gather information
  const searchUrls = [
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json`,
  ];
  
  let researchContent = "";
  
  // Try to fetch from Wikipedia API for factual information
  try {
    const wikiSearchResponse = await fetch(searchUrls[0]);
    if (wikiSearchResponse.ok) {
      const wikiData = await wikiSearchResponse.json();
      const titles = wikiData[1] || [];
      const descriptions = wikiData[2] || [];
      const urls = wikiData[3] || [];
      
      if (titles.length > 0) {
        researchContent += "## Wikipedia Research Results\n\n";
        for (let i = 0; i < titles.length; i++) {
          researchContent += `### ${titles[i]}\n`;
          researchContent += `${descriptions[i]}\n`;
          researchContent += `Source: ${urls[i]}\n\n`;
          
          // Fetch full article extract
          try {
            const extractUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles[i])}`;
            const extractResponse = await fetch(extractUrl);
            if (extractResponse.ok) {
              const extractData = await extractResponse.json();
              if (extractData.extract) {
                researchContent += `**Summary:** ${extractData.extract}\n\n`;
              }
            }
          } catch (e) {
            console.log("Could not fetch extract for:", titles[i]);
          }
        }
      }
    }
  } catch (error) {
    console.log("Wikipedia search error:", error);
  }

  // Fetch from Hacker News for tech news
  try {
    const hnSearchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`;
    const hnResponse = await fetch(hnSearchUrl);
    if (hnResponse.ok) {
      const hnData = await hnResponse.json();
      if (hnData.hits && hnData.hits.length > 0) {
        researchContent += "\n## Recent Tech News & Discussions\n\n";
        for (const hit of hnData.hits) {
          researchContent += `### ${hit.title}\n`;
          if (hit.url) researchContent += `Source: ${hit.url}\n`;
          researchContent += `Points: ${hit.points} | Comments: ${hit.num_comments}\n`;
          researchContent += `Posted: ${hit.created_at}\n\n`;
        }
      }
    }
  } catch (error) {
    console.log("HN search error:", error);
  }

  // Fetch from arXiv for academic papers (if AI/ML related)
  if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('machine learning') || 
      query.toLowerCase().includes('neural') || query.toLowerCase().includes('model')) {
    try {
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3`;
      const arxivResponse = await fetch(arxivUrl);
      if (arxivResponse.ok) {
        const arxivText = await arxivResponse.text();
        // Simple parsing of arXiv XML response
        const entries = arxivText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        if (entries.length > 0) {
          researchContent += "\n## Academic Research Papers\n\n";
          for (const entry of entries) {
            const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || "";
            const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim() || "";
            const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || "";
            if (title) {
              researchContent += `### ${title.replace(/\n/g, ' ')}\n`;
              researchContent += `Published: ${published}\n`;
              researchContent += `Abstract: ${summary.substring(0, 500).replace(/\n/g, ' ')}...\n\n`;
            }
          }
        }
      }
    } catch (error) {
      console.log("arXiv search error:", error);
    }
  }

  if (!researchContent) {
    researchContent = `Research query: "${query}"\n\nNote: Limited external data was available. The article will be generated based on general knowledge about this topic.`;
  }

  console.log("Research content gathered, length:", researchContent.length);
  return researchContent;
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

    let inputContent = content;
    
    // For deep-research, first gather web content
    if (action === "deep-research") {
      console.log("Starting deep research for:", content);
      const researchData = await fetchWebContent(content);
      inputContent = `RESEARCH TOPIC: ${content}\n\n--- GATHERED RESEARCH DATA ---\n\n${researchData}\n\n--- END OF RESEARCH DATA ---\n\nBased on the above research, write a comprehensive article about: ${content}`;
    }

    const systemPrompt = getSystemPrompt(action as AssistAction);

    console.log("Calling AI gateway with action:", action);
    
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
          { role: "user", content: inputContent },
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

    console.log("AI response received, length:", result.length);

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
