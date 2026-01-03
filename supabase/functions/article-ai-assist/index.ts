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

function getSystemPrompt(action: AssistAction, options?: ArticleOptions): string {
  const toneInstructions: Record<string, string> = {
    professional: "Write in a professional, authoritative tone suitable for a major tech publication.",
    conversational: "Write in a friendly, conversational tone that feels like talking to a knowledgeable friend.",
    academic: "Write in an academic tone with precise language and rigorous analysis.",
    engaging: "Write in an engaging, storytelling style that draws readers in with narratives and compelling hooks.",
  };

  const lengthInstructions: Record<string, string> = {
    short: "Keep the article concise, around 500 words for main content.",
    medium: "Write a medium-length article, around 1000 words for main content.",
    long: "Write a comprehensive article, around 1500 words for main content.",
    comprehensive: "Write an in-depth, comprehensive article of 2500+ words for main content.",
  };

  const articleOptions = options ? `
Additional Instructions:
- Tone: ${toneInstructions[options.tone] || toneInstructions.professional}
- Length: ${lengthInstructions[options.length] || lengthInstructions.medium}
${options.targetKeywords ? `- Target Keywords: Naturally incorporate these keywords: ${options.targetKeywords}` : ""}
${options.includeDataViz ? `- Include data visualizations: Embed real charts, graphs, and benchmark images from sources when available. Use <img src="URL" alt="description" class="article-image" /> for extracted images.` : ""}
${options.includeSources ? "- Include source citations: Reference sources with [Source: name/URL] format where appropriate" : ""}
${options.includeQuotes ? "- Include expert quotes: Add relevant expert opinions or quotes where they strengthen the narrative" : ""}
- Creativity level: ${options.creativityLevel}% (0=very factual and conservative, 100=very creative and bold)
` : "";

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

    "write-article": `You are an expert AI/tech journalist for Cognitive Ledger, an authoritative AI news publication. Write a complete article and return it as a JSON object with the following structure:

{
  "title": "The headline of the article",
  "excerpt": "A compelling 1-2 sentence summary (max 200 chars)",
  "content": "The main article content in HTML format with proper paragraphs, headings, etc.",
  "simple_content": "A simplified version for non-technical readers in HTML format",
  "technical_content": "A technical deep-dive version for experts in HTML format"
}
${articleOptions}
Guidelines:
- Main content: Professional journalism style with compelling narrative
- Simple content: Same story but accessible to general audience, no jargon
- Technical content: Deep technical analysis for developers/researchers
- Use HTML tags like <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>, <blockquote> for formatting
- Return ONLY valid JSON, no markdown code blocks or extra text`,

    "deep-research": `You are an expert AI/tech journalist for Cognitive Ledger. Based on the research provided, write a comprehensive, well-sourced article and return it as a JSON object:

{
  "title": "The headline of the article",
  "excerpt": "A compelling 1-2 sentence summary (max 200 chars)",
  "content": "The main article content in HTML format",
  "simple_content": "A simplified version for non-technical readers in HTML format",
  "technical_content": "A technical deep-dive version for experts in HTML format"
}
${articleOptions}
Guidelines:
- Synthesize research from multiple sources with proper attribution
- Include inline citations like [Source: name] that reference the researched sources
- CRITICAL: Use actual images from the sources (marked as [EXTRACTED_IMAGE: url from source]) 
  - Insert benchmark charts, performance graphs, and comparison diagrams found in sources using <img src="URL" alt="description" class="article-image" />
  - Prioritize images showing: benchmark scores, performance comparisons, architecture diagrams, data visualizations
  - Do NOT suggest placeholder images like [CHART: description] - use REAL images from the extracted sources
  - Include relevant screenshots, diagrams, and infographics from the original sources
- Simple content: Accessible to general audience
- Technical content: Deep analysis for experts
- Use HTML tags for formatting including <blockquote> for key quotes
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

interface ArticleOptions {
  tone: string;
  length: string;
  includeDataViz: boolean;
  includeSources: boolean;
  includeQuotes: boolean;
  targetKeywords?: string;
  creativityLevel: number;
}

interface ScrapedContent {
  markdown: string;
  images: string[];
}

// Use Jina Reader API to scrape web content as markdown and extract images
async function scrapeWithJina(url: string): Promise<ScrapedContent> {
  console.log("Scraping URL with Jina Reader:", url);
  
  try {
    // First get markdown content
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: "GET",
      headers: {
        "Accept": "text/markdown",
        "X-Return-Format": "markdown",
        "X-No-Cache": "true",
        "X-With-Images-Summary": "true",
      },
    });

    if (!response.ok) {
      console.log("Jina Reader error:", response.status);
      return { markdown: "", images: [] };
    }

    const markdown = await response.text();
    
    // Extract image URLs from the markdown content
    const images: string[] = [];
    
    // Match markdown image syntax: ![alt](url)
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(markdown)) !== null) {
      const imageUrl = match[2];
      if (imageUrl && isValidImageUrl(imageUrl)) {
        images.push(imageUrl);
      }
    }
    
    // Match HTML img tags: <img src="url">
    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    while ((match = htmlImageRegex.exec(markdown)) !== null) {
      const imageUrl = match[1];
      if (imageUrl && isValidImageUrl(imageUrl) && !images.includes(imageUrl)) {
        images.push(imageUrl);
      }
    }
    
    console.log(`Found ${images.length} images from ${url}`);
    
    // Limit content to prevent token overflow
    return { 
      markdown: markdown.substring(0, 15000),
      images: images.slice(0, 10) // Limit to 10 images per source
    };
  } catch (error) {
    console.log("Jina Reader fetch error:", error);
    return { markdown: "", images: [] };
  }
}

// Validate image URL - prioritize benchmark, chart, and diagram images
function isValidImageUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  
  // Must start with http/https
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  
  // Skip tiny icons, tracking pixels, and common non-content images
  const skipPatterns = [
    "favicon", "icon-", "logo-small",
    "tracking", "pixel", "beacon",
    "badge", "button", "banner-ad",
    "ads/", "advert", "sponsor",
    "1x1", "2x2", "transparent.gif",
    "spacer", "blank.gif", "clear.gif"
  ];
  
  const lowerUrl = url.toLowerCase();
  for (const pattern of skipPatterns) {
    if (lowerUrl.includes(pattern)) return false;
  }
  
  // Prioritize benchmark, chart, graph, and diagram images
  const priorityPatterns = [
    "benchmark", "chart", "graph", "diagram", 
    "comparison", "performance", "results",
    "score", "test", "evaluation", "metric",
    "architecture", "model", "framework"
  ];
  
  for (const pattern of priorityPatterns) {
    if (lowerUrl.includes(pattern)) return true;
  }
  
  // Check for common image extensions or image CDN patterns
  const imagePatterns = [
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    "/image/", "/images/", "/img/", "/photos/",
    "cloudinary.com", "imgix.net", "unsplash.com",
    "imgur.com", "wp-content/uploads", "/assets/",
    "/media/", "/static/", "cdn.", "res.cloudinary"
  ];
  
  for (const pattern of imagePatterns) {
    if (lowerUrl.includes(pattern)) return true;
  }
  
  // If URL has typical image dimensions or content patterns
  if (/\d{3,4}x\d{3,4}/.test(url)) return true;
  
  return false;
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

interface ResearchResult {
  content: string;
  images: string[];
}

async function deepResearch(query: string): Promise<ResearchResult> {
  console.log("Starting deep research for:", query);
  
  let researchContent = `# Research Results for: "${query}"\n\n`;
  const allImages: string[] = [];
  
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
    return { content: researchContent, images: [] };
  }

  // Step 2: Scrape each URL using Jina Reader for real content and images
  let successfulScrapes = 0;
  for (const url of urls.slice(0, 15)) { // Limit to 15 URLs
    console.log("Scraping URL:", url);
    
    try {
      const scraped = await scrapeWithJina(url);
      
      if (scraped.markdown && scraped.markdown.length > 200) {
        researchContent += `\n---\n## Source: ${url}\n\n`;
        // Truncate each source to manage token limits
        researchContent += scraped.markdown.substring(0, 5000) + "\n";
        
        // Collect images with source attribution
        for (const img of scraped.images) {
          if (!allImages.includes(img)) {
            allImages.push(img);
            researchContent += `\n[EXTRACTED_IMAGE: ${img} from ${url}]\n`;
          }
        }
        
        successfulScrapes++;
        
        // Stop if we have enough content
        if (successfulScrapes >= 10) break;
      }
    } catch (error) {
      console.log("Error scraping URL:", url, error);
    }
  }

  console.log("Research complete. Successful scrapes:", successfulScrapes, "Images found:", allImages.length, "Content length:", researchContent.length);
  return { content: researchContent, images: allImages };
}

async function researchModel(modelQuery: string): Promise<ResearchResult> {
  console.log("Starting model research for:", modelQuery);
  
  let researchContent = `# AI Model Research: "${modelQuery}"\n\n`;
  const allImages: string[] = [];
  
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
    return { content: researchContent, images: [] };
  }

  // Scrape each URL
  let successfulScrapes = 0;
  for (const url of allUrls.slice(0, 10)) {
    try {
      const scraped = await scrapeWithJina(url);
      
      if (scraped.markdown && scraped.markdown.length > 200) {
        researchContent += `\n---\n## Source: ${url}\n\n`;
        researchContent += scraped.markdown.substring(0, 4000) + "\n";
        
        // Collect images
        for (const img of scraped.images) {
          if (!allImages.includes(img)) {
            allImages.push(img);
            researchContent += `\n[EXTRACTED_IMAGE: ${img} from ${url}]\n`;
          }
        }
        
        successfulScrapes++;
        
        if (successfulScrapes >= 6) break;
      }
    } catch (error) {
      console.log("Error scraping URL:", url, error);
    }
  }

  console.log("Model research complete. Scrapes:", successfulScrapes, "Images:", allImages.length);
  return { content: researchContent, images: allImages };
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
    let articleOptions: ArticleOptions | undefined;
    
    // Parse options for article actions
    if (action === "write-article" || action === "deep-research") {
      try {
        const parsed = JSON.parse(content);
        if (parsed.topic && parsed.options) {
          inputContent = parsed.topic;
          articleOptions = parsed.options;
        }
      } catch {
        // Content is plain text topic
      }
    }
    
    let extractedImages: string[] = [];
    
    // For deep-research, gather web content and images
    if (action === "deep-research") {
      console.log("Starting deep research for:", inputContent);
      const researchResult = await deepResearch(inputContent);
      extractedImages = researchResult.images;
      inputContent = `RESEARCH TOPIC: ${inputContent}\n\n--- GATHERED RESEARCH DATA ---\n\n${researchResult.content}\n\n--- END OF RESEARCH DATA ---\n\nBased on the above research, write a comprehensive, well-sourced article about: ${inputContent}\n\nIMPORTANT: The research includes [EXTRACTED_IMAGE: url] markers. When you find relevant images from the sources, include them in your article using: <img src="IMAGE_URL" alt="description" /> tags. Choose the most relevant charts, graphs, diagrams, or photos that enhance the article content.`;
    }
    
    // For research-model, gather model-specific information
    if (action === "research-model") {
      console.log("Starting model research for:", content);
      const researchResult = await researchModel(content);
      extractedImages = researchResult.images;
      inputContent = `AI MODEL TO RESEARCH: ${content}\n\n--- GATHERED RESEARCH DATA ---\n\n${researchResult.content}\n\n--- END OF RESEARCH DATA ---\n\nBased on the above research, extract comprehensive information about the AI model: ${content}`;
    }

    const systemPrompt = getSystemPrompt(action as AssistAction, articleOptions);

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
            structured,
            extractedImages: extractedImages.length > 0 ? extractedImages : undefined
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
