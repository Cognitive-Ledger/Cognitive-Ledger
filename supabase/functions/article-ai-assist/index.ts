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
  | "deep-research"
  | "research-model";

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

    "write-article": `You are an expert AI/tech journalist. Write a complete article and return it as a JSON object with the following structure:

{
  "title": "The headline of the article",
  "excerpt": "A compelling 1-2 sentence summary (max 200 chars)",
  "content": "The main article content in HTML format with proper paragraphs, headings, etc.",
  "simple_content": "A simplified version for non-technical readers in HTML format",
  "technical_content": "A technical deep-dive version for experts in HTML format"
}

Guidelines:
- Main content: 800-1500 words, professional journalism style
- Simple content: Same story but accessible to general audience, no jargon
- Technical content: Deep technical analysis for developers/researchers
- Use HTML tags like <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em> for formatting
- Return ONLY valid JSON, no markdown code blocks or extra text`,

    "deep-research": `You are an expert AI/tech journalist. Based on the research provided, write a comprehensive article and return it as a JSON object:

{
  "title": "The headline of the article",
  "excerpt": "A compelling 1-2 sentence summary (max 200 chars)",
  "content": "The main article content in HTML format",
  "simple_content": "A simplified version for non-technical readers in HTML format",
  "technical_content": "A technical deep-dive version for experts in HTML format"
}

Guidelines:
- Synthesize research from multiple sources with proper attribution
- Main content: 1000-2000 words
- Simple content: Accessible to general audience
- Technical content: Deep analysis for experts
- Use HTML tags for formatting
- Return ONLY valid JSON, no markdown code blocks or extra text`,

    "research-model": `You are an AI expert researcher. Based on the research provided about an AI model, extract and return comprehensive information as a JSON object:

{
  "name": "Official model name (e.g., GPT-4, Claude 3, Gemini Pro)",
  "version": "Version number or identifier",
  "provider": "Company/organization name (e.g., OpenAI, Anthropic, Google)",
  "category": "Model category (LLM, Image Generation, Multimodal, Speech, Embedding, Code, Vision)",
  "description": "Detailed 2-3 sentence description of the model's capabilities and purpose",
  "release_date": "Release date in YYYY-MM-DD format",
  "parameters": "Parameter count (e.g., 175B, 1.76T, Unknown)",
  "context_window": "Context window size (e.g., 128K tokens, 200K tokens)",
  "pricing": "Pricing info (e.g., $0.03/1K input tokens, Free tier available)",
  "benchmarks": {
    "MMLU": 86.4,
    "HumanEval": 67.0,
    "GSM8K": 92.0
  }
}

Guidelines:
- Extract accurate, factual information from the research
- Use real benchmark scores when available, omit if not found
- For unknown fields, use reasonable estimates or "Unknown"
- Return ONLY valid JSON, no markdown code blocks`,
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

// Search using DuckDuckGo HTML for real web search results
async function searchDuckDuckGo(query: string): Promise<string[]> {
  console.log("Searching DuckDuckGo for:", query);
  const urls: string[] = [];
  
  try {
    const searchQuery = encodeURIComponent(query);
    const ddgHtmlUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;
    
    const ddgResponse = await fetch(ddgHtmlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    
    if (ddgResponse.ok) {
      const html = await ddgResponse.text();
      
      // Extract URLs from DuckDuckGo HTML results
      const uddgMatches = html.matchAll(/uddg=([^&"']+)/g);
      for (const match of uddgMatches) {
        try {
          const decodedUrl = decodeURIComponent(match[1]);
          if (decodedUrl.startsWith("http") && !decodedUrl.includes("duckduckgo.com")) {
            urls.push(decodedUrl);
          }
        } catch (e) {
          // Skip malformed URLs
        }
      }
      
      // Also extract from result links directly
      const hrefMatches = html.matchAll(/href="(https?:\/\/[^"]+)"/g);
      for (const match of hrefMatches) {
        const url = match[1];
        if (!url.includes("duckduckgo.com") && 
            !url.includes("duck.co") &&
            !url.includes("spread.duckduckgo") &&
            !urls.includes(url)) {
          urls.push(url);
        }
      }
      
      console.log("DuckDuckGo found URLs:", urls.length);
    }
  } catch (error) {
    console.log("DuckDuckGo search error:", error);
  }
  
  return urls;
}

// Search using Brave Search API (free tier available)
async function searchBrave(query: string): Promise<string[]> {
  console.log("Searching Brave for:", query);
  const urls: string[] = [];
  
  try {
    // Brave Search has a free web search that can be scraped
    const searchQuery = encodeURIComponent(query);
    const braveUrl = `https://search.brave.com/search?q=${searchQuery}&source=web`;
    
    const response = await fetch(braveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Extract URLs from Brave search results
      const hrefMatches = html.matchAll(/href="(https?:\/\/[^"]+)"/g);
      for (const match of hrefMatches) {
        const url = match[1];
        if (!url.includes("brave.com") && 
            !url.includes("bravesoftware.com") &&
            !urls.includes(url) &&
            !url.includes("/search?") &&
            url.length < 300) {
          urls.push(url);
        }
      }
      
      console.log("Brave found URLs:", urls.length);
    }
  } catch (error) {
    console.log("Brave search error:", error);
  }
  
  return urls;
}

// Search using Bing (scraping)
async function searchBing(query: string): Promise<string[]> {
  console.log("Searching Bing for:", query);
  const urls: string[] = [];
  
  try {
    const searchQuery = encodeURIComponent(query);
    const bingUrl = `https://www.bing.com/search?q=${searchQuery}&count=20`;
    
    const response = await fetch(bingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Extract URLs from Bing search results
      const hrefMatches = html.matchAll(/href="(https?:\/\/[^"]+)"/g);
      for (const match of hrefMatches) {
        const url = match[1];
        if (!url.includes("bing.com") && 
            !url.includes("microsoft.com") &&
            !url.includes("msn.com") &&
            !urls.includes(url) &&
            !url.includes("/search?") &&
            url.length < 300) {
          urls.push(url);
        }
      }
      
      console.log("Bing found URLs:", urls.length);
    }
  } catch (error) {
    console.log("Bing search error:", error);
  }
  
  return urls;
}

// Search using Google (via scraping fallback)
async function searchGoogle(query: string): Promise<string[]> {
  console.log("Searching Google for:", query);
  const urls: string[] = [];
  
  try {
    const searchQuery = encodeURIComponent(query);
    const googleUrl = `https://www.google.com/search?q=${searchQuery}&num=20`;
    
    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Extract URLs from Google search results
      // Google uses /url?q= format for external links
      const urlMatches = html.matchAll(/\/url\?q=(https?:\/\/[^&]+)/g);
      for (const match of urlMatches) {
        try {
          const decodedUrl = decodeURIComponent(match[1]);
          if (!decodedUrl.includes("google.com") && 
              !decodedUrl.includes("googleapis.com") &&
              !urls.includes(decodedUrl) &&
              decodedUrl.length < 300) {
            urls.push(decodedUrl);
          }
        } catch (e) {
          // Skip malformed URLs
        }
      }
      
      // Also try direct href extraction
      const hrefMatches = html.matchAll(/href="(https?:\/\/[^"]+)"/g);
      for (const match of hrefMatches) {
        const url = match[1];
        if (!url.includes("google.com") && 
            !url.includes("googleapis.com") &&
            !url.includes("gstatic.com") &&
            !urls.includes(url) &&
            url.length < 300) {
          urls.push(url);
        }
      }
      
      console.log("Google found URLs:", urls.length);
    }
  } catch (error) {
    console.log("Google search error:", error);
  }
  
  return urls;
}

// Search using SearXNG public instances (meta-search engine)
async function searchSearXNG(query: string): Promise<string[]> {
  console.log("Searching SearXNG for:", query);
  const urls: string[] = [];
  
  // Try multiple public SearXNG instances
  const instances = [
    "https://searx.be",
    "https://search.sapti.me",
    "https://searx.tiekoetter.com",
  ];
  
  for (const instance of instances) {
    try {
      const searchQuery = encodeURIComponent(query);
      const searxUrl = `${instance}/search?q=${searchQuery}&format=json&categories=general`;
      
      const response = await fetch(searxUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.results && Array.isArray(data.results)) {
          for (const result of data.results) {
            if (result.url && !urls.includes(result.url)) {
              urls.push(result.url);
            }
          }
        }
        
        console.log(`SearXNG (${instance}) found URLs:`, urls.length);
        if (urls.length > 0) break; // Stop if we got results
      }
    } catch (error) {
      console.log(`SearXNG (${instance}) error:`, error);
    }
  }
  
  return urls;
}

// Combined multi-engine search
async function searchWeb(query: string): Promise<string[]> {
  console.log("Starting multi-engine search for:", query);
  
  // Run all search engines in parallel for speed
  const [duckduckgoUrls, braveUrls, bingUrls, googleUrls, searxngUrls] = await Promise.all([
    searchDuckDuckGo(query),
    searchBrave(query),
    searchBing(query),
    searchGoogle(query),
    searchSearXNG(query),
  ]);
  
  // Combine and deduplicate URLs
  const allUrls = [...duckduckgoUrls, ...braveUrls, ...bingUrls, ...googleUrls, ...searxngUrls];
  
  // Filter and deduplicate
  const uniqueUrls = [...new Set(allUrls)].filter(url => {
    const lowerUrl = url.toLowerCase();
    return !lowerUrl.includes("facebook.com/login") &&
           !lowerUrl.includes("twitter.com/login") &&
           !lowerUrl.includes("/signup") &&
           !lowerUrl.includes("/login") &&
           !lowerUrl.includes("linkedin.com/login") &&
           url.length < 500;
  });
  
  console.log("Multi-engine search total unique URLs:", uniqueUrls.length);
  return uniqueUrls.slice(0, 15); // Get up to 15 diverse sources
}

async function deepResearch(query: string): Promise<string> {
  console.log("Starting deep research for:", query);
  
  let researchContent = `# Research Results for: "${query}"\n\n`;
  
  // Step 1: Search the web using multiple engines
  const urls = await searchWeb(query);
  
  // Also search with related keywords for broader coverage
  const relatedQueries = [
    `${query} latest news 2024 2025`,
    `${query} analysis review`,
  ];
  
  for (const relatedQuery of relatedQueries) {
    const additionalUrls = await searchWeb(relatedQuery);
    for (const url of additionalUrls) {
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }
    // Don't get too many URLs
    if (urls.length >= 20) break;
  }
  
  console.log("Total URLs to research:", urls.length);
  
  if (urls.length === 0) {
    researchContent += "Note: No specific web sources found. Article will be generated based on general knowledge.\n";
    return researchContent;
  }

  // Step 2: Scrape each URL using Jina Reader for real content
  let successfulScrapes = 0;
  for (const url of urls.slice(0, 15)) { // Limit to 15 URLs
    console.log("Scraping URL:", url);
    
    try {
      const content = await scrapeWithJina(url);
      
      if (content && content.length > 200) {
        researchContent += `\n---\n## Source: ${url}\n\n`;
        // Truncate each source to manage token limits
        researchContent += content.substring(0, 5000) + "\n";
        successfulScrapes++;
        
        // Stop if we have enough content
        if (successfulScrapes >= 10) break;
      }
    } catch (error) {
      console.log("Error scraping URL:", url, error);
    }
  }

  console.log("Research complete. Successful scrapes:", successfulScrapes, "Content length:", researchContent.length);
  return researchContent;
}

async function researchModel(modelQuery: string): Promise<string> {
  console.log("Starting model research for:", modelQuery);
  
  let researchContent = `# AI Model Research: "${modelQuery}"\n\n`;
  
  // Search for model-specific information
  const searchQueries = [
    `${modelQuery} AI model specifications`,
    `${modelQuery} benchmarks performance`,
    `${modelQuery} release announcement`,
    `${modelQuery} pricing API`,
  ];
  
  const allUrls: string[] = [];
  
  for (const query of searchQueries) {
    const urls = await searchWeb(query);
    for (const url of urls) {
      if (!allUrls.includes(url)) {
        allUrls.push(url);
      }
    }
    if (allUrls.length >= 15) break;
  }
  
  console.log("Total model research URLs:", allUrls.length);
  
  if (allUrls.length === 0) {
    researchContent += "Note: Limited sources found. Model information will be based on general knowledge.\n";
    return researchContent;
  }

  // Scrape each URL
  let successfulScrapes = 0;
  for (const url of allUrls.slice(0, 10)) {
    try {
      const content = await scrapeWithJina(url);
      
      if (content && content.length > 200) {
        researchContent += `\n---\n## Source: ${url}\n\n`;
        researchContent += content.substring(0, 4000) + "\n";
        successfulScrapes++;
        
        if (successfulScrapes >= 6) break;
      }
    } catch (error) {
      console.log("Error scraping URL:", url, error);
    }
  }

  console.log("Model research complete. Scrapes:", successfulScrapes);
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
    
    // For deep-research, gather web content
    if (action === "deep-research") {
      console.log("Starting deep research for:", content);
      const researchData = await deepResearch(content);
      inputContent = `RESEARCH TOPIC: ${content}\n\n--- GATHERED RESEARCH DATA ---\n\n${researchData}\n\n--- END OF RESEARCH DATA ---\n\nBased on the above research, write a comprehensive, well-sourced article about: ${content}`;
    }
    
    // For research-model, gather model-specific information
    if (action === "research-model") {
      console.log("Starting model research for:", content);
      const researchData = await researchModel(content);
      inputContent = `AI MODEL TO RESEARCH: ${content}\n\n--- GATHERED RESEARCH DATA ---\n\n${researchData}\n\n--- END OF RESEARCH DATA ---\n\nBased on the above research, extract comprehensive information about the AI model: ${content}`;
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
    let result = data.choices?.[0]?.message?.content || "";

    console.log("AI response received, length:", result.length);

    // For structured responses, try to parse as JSON
    if (action === "write-article" || action === "deep-research" || action === "research-model") {
      try {
        // Clean up potential markdown code block wrapping
        let jsonStr = result.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith("```")) {
          jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();
        
        const structured = JSON.parse(jsonStr);
        console.log("Parsed structured data");
        
        return new Response(
          JSON.stringify({ 
            result,
            structured
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.log("Could not parse as JSON, returning raw result:", parseError);
      }
    }

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
