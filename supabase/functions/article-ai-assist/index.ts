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

// Use Jina Reader API to scrape web content as markdown
async function scrapeWithJina(url: string): Promise<string> {
  console.log("Scraping URL with Jina Reader:", url);
  
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: "GET",
      headers: {
        "Accept": "text/markdown",
        "X-Return-Format": "markdown",
        "X-No-Cache": "true",
      },
    });

    if (!response.ok) {
      console.log("Jina Reader error:", response.status);
      return "";
    }

    const markdown = await response.text();
    // Limit content to prevent token overflow
    return markdown.substring(0, 15000);
  } catch (error) {
    console.log("Jina Reader fetch error:", error);
    return "";
  }
}

// Search using DuckDuckGo HTML (no API key needed)
async function searchWeb(query: string): Promise<string[]> {
  console.log("Searching for:", query);
  
  const urls: string[] = [];
  
  // Use Hacker News search for tech topics (reliable API)
  try {
    const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`;
    const hnResponse = await fetch(hnUrl);
    if (hnResponse.ok) {
      const hnData = await hnResponse.json();
      for (const hit of hnData.hits || []) {
        if (hit.url) {
          urls.push(hit.url);
        }
      }
    }
  } catch (error) {
    console.log("HN search error:", error);
  }

  // Add Wikipedia article if relevant
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=2&format=json`;
    const wikiResponse = await fetch(wikiUrl);
    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json();
      const wikiUrls = wikiData[3] || [];
      urls.push(...wikiUrls);
    }
  } catch (error) {
    console.log("Wikipedia search error:", error);
  }

  console.log("Found URLs:", urls.length);
  return urls.slice(0, 5); // Limit to 5 URLs
}

async function deepResearch(query: string): Promise<string> {
  console.log("Starting deep research for:", query);
  
  let researchContent = `# Research Results for: "${query}"\n\n`;
  
  // Step 1: Find relevant URLs
  const urls = await searchWeb(query);
  
  if (urls.length === 0) {
    researchContent += "Note: No specific web sources found. Article will be generated based on general knowledge.\n";
    return researchContent;
  }

  // Step 2: Scrape each URL using Jina Reader
  for (const url of urls) {
    console.log("Processing URL:", url);
    
    try {
      const content = await scrapeWithJina(url);
      
      if (content && content.length > 100) {
        researchContent += `\n---\n## Source: ${url}\n\n`;
        // Truncate each source to avoid token limits
        researchContent += content.substring(0, 8000) + "\n";
      }
    } catch (error) {
      console.log("Error processing URL:", url, error);
    }
  }

  // Step 3: Add recent news from Hacker News discussions
  try {
    const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`;
    const hnResponse = await fetch(hnUrl);
    if (hnResponse.ok) {
      const hnData = await hnResponse.json();
      if (hnData.hits && hnData.hits.length > 0) {
        researchContent += "\n---\n## Recent Tech News & Discussions (Hacker News)\n\n";
        for (const hit of hnData.hits) {
          researchContent += `### ${hit.title}\n`;
          if (hit.url) researchContent += `Source: ${hit.url}\n`;
          researchContent += `Points: ${hit.points} | Comments: ${hit.num_comments}\n`;
          researchContent += `Posted: ${hit.created_at}\n\n`;
        }
      }
    }
  } catch (error) {
    console.log("HN news fetch error:", error);
  }

  // Step 4: Add arXiv papers for academic content
  if (query.toLowerCase().includes('ai') || query.toLowerCase().includes('machine learning') || 
      query.toLowerCase().includes('neural') || query.toLowerCase().includes('model') ||
      query.toLowerCase().includes('llm') || query.toLowerCase().includes('gpt')) {
    try {
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3&sortBy=submittedDate&sortOrder=descending`;
      const arxivResponse = await fetch(arxivUrl);
      if (arxivResponse.ok) {
        const arxivText = await arxivResponse.text();
        const entries = arxivText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        if (entries.length > 0) {
          researchContent += "\n---\n## Academic Research Papers (arXiv)\n\n";
          for (const entry of entries) {
            const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || "";
            const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim() || "";
            const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() || "";
            const link = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || "";
            if (title) {
              researchContent += `### ${title.replace(/\n/g, ' ')}\n`;
              researchContent += `Published: ${published}\n`;
              researchContent += `Link: ${link}\n`;
              researchContent += `Abstract: ${summary.substring(0, 800).replace(/\n/g, ' ')}...\n\n`;
            }
          }
        }
      }
    } catch (error) {
      console.log("arXiv search error:", error);
    }
  }

  console.log("Research complete, content length:", researchContent.length);
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
    
    // For deep-research, gather web content using Jina Reader
    if (action === "deep-research") {
      console.log("Starting deep research for:", content);
      const researchData = await deepResearch(content);
      inputContent = `RESEARCH TOPIC: ${content}\n\n--- GATHERED RESEARCH DATA ---\n\n${researchData}\n\n--- END OF RESEARCH DATA ---\n\nBased on the above research, write a comprehensive, well-sourced article about: ${content}`;
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
