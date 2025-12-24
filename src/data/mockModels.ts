export interface AIModel {
  slug: string;
  name: string;
  provider: string;
  currentVersion: string;
  releaseDate: string;
  description: string;
  pricing?: string;
  benchmarks: { name: string; score: string }[];
  logoUrl?: string;
  versionHistory: { version: string; date: string; notes: string }[];
}

export const mockModels: AIModel[] = [
  {
    slug: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    currentVersion: "gpt-4-turbo-2024-04-09",
    releaseDate: "March 2023",
    description: "OpenAI's most capable model, featuring advanced reasoning, broad knowledge, and multimodal capabilities including vision.",
    pricing: "$10/1M input tokens, $30/1M output tokens",
    benchmarks: [
      { name: "MMLU", score: "86.4%" },
      { name: "HumanEval", score: "67.0%" },
      { name: "GSM8K", score: "92.0%" },
      { name: "MATH", score: "52.9%" }
    ],
    versionHistory: [
      { version: "gpt-4-turbo-2024-04-09", date: "April 2024", notes: "Improved instruction following, JSON mode stability" },
      { version: "gpt-4-0125-preview", date: "January 2024", notes: "Reduced laziness in coding tasks" },
      { version: "gpt-4-1106-preview", date: "November 2023", notes: "128K context, improved function calling" },
      { version: "gpt-4-0613", date: "June 2023", notes: "Function calling support" },
      { version: "gpt-4-0314", date: "March 2023", notes: "Initial release" }
    ]
  },
  {
    slug: "claude-3",
    name: "Claude 3",
    provider: "Anthropic",
    currentVersion: "claude-3.5-sonnet-20241022",
    releaseDate: "March 2024",
    description: "Anthropic's latest model family featuring Opus, Sonnet, and Haiku variants with industry-leading safety and reasoning capabilities.",
    pricing: "$3/1M input, $15/1M output (Sonnet)",
    benchmarks: [
      { name: "MMLU", score: "88.7%" },
      { name: "HumanEval", score: "92.0%" },
      { name: "GSM8K", score: "95.0%" },
      { name: "MATH", score: "71.1%" }
    ],
    versionHistory: [
      { version: "claude-3.5-sonnet-20241022", date: "October 2024", notes: "Computer use capability, improved coding" },
      { version: "claude-3.5-sonnet-20240620", date: "June 2024", notes: "2x speed improvement, enhanced vision" },
      { version: "claude-3-opus-20240229", date: "March 2024", notes: "Most capable Claude model" },
      { version: "claude-3-sonnet-20240229", date: "March 2024", notes: "Balanced performance and speed" },
      { version: "claude-3-haiku-20240307", date: "March 2024", notes: "Fastest, most cost-effective" }
    ]
  },
  {
    slug: "gemini",
    name: "Gemini",
    provider: "Google DeepMind",
    currentVersion: "gemini-2.0-flash-exp",
    releaseDate: "December 2023",
    description: "Google's most capable AI model, designed for multimodal understanding across text, images, audio, and video with native tool use.",
    pricing: "Free tier available, Pro pricing varies",
    benchmarks: [
      { name: "MMLU", score: "90.0%" },
      { name: "HumanEval", score: "74.4%" },
      { name: "GSM8K", score: "94.4%" },
      { name: "MATH", score: "53.2%" }
    ],
    versionHistory: [
      { version: "gemini-2.0-flash-exp", date: "December 2024", notes: "Multimodal live API, native tool use" },
      { version: "gemini-1.5-pro-002", date: "September 2024", notes: "Improved 2M context handling" },
      { version: "gemini-1.5-flash", date: "May 2024", notes: "Optimized for speed and efficiency" },
      { version: "gemini-1.0-ultra", date: "February 2024", notes: "Full Ultra model release" },
      { version: "gemini-1.0-pro", date: "December 2023", notes: "Initial release" }
    ]
  },
  {
    slug: "llama-3",
    name: "Llama 3",
    provider: "Meta",
    currentVersion: "llama-3.3-70b-instruct",
    releaseDate: "April 2024",
    description: "Meta's open-weight large language model family, available in 8B, 70B, and 405B parameter variants for research and commercial use.",
    pricing: "Open weights, self-hosted",
    benchmarks: [
      { name: "MMLU", score: "86.0% (405B)" },
      { name: "HumanEval", score: "89.0% (405B)" },
      { name: "GSM8K", score: "96.8% (405B)" },
      { name: "MATH", score: "73.8% (405B)" }
    ],
    versionHistory: [
      { version: "llama-3.3-70b-instruct", date: "December 2024", notes: "Improved instruction following" },
      { version: "llama-3.2-vision", date: "September 2024", notes: "Multimodal capabilities" },
      { version: "llama-3.1-405b-instruct", date: "July 2024", notes: "Largest open model, 128K context" },
      { version: "llama-3-70b-instruct", date: "April 2024", notes: "Strong reasoning capabilities" },
      { version: "llama-3-8b-instruct", date: "April 2024", notes: "Efficient, fast inference" }
    ]
  },
  {
    slug: "mistral",
    name: "Mistral Large",
    provider: "Mistral AI",
    currentVersion: "mistral-large-2411",
    releaseDate: "February 2024",
    description: "Mistral AI's flagship model offering strong multilingual capabilities, function calling, and competitive performance at lower costs.",
    pricing: "$2/1M input, $6/1M output",
    benchmarks: [
      { name: "MMLU", score: "84.0%" },
      { name: "HumanEval", score: "92.1%" },
      { name: "GSM8K", score: "91.2%" },
      { name: "MATH", score: "47.5%" }
    ],
    versionHistory: [
      { version: "mistral-large-2411", date: "November 2024", notes: "128K context, improved function calling" },
      { version: "mistral-large-2407", date: "July 2024", notes: "Enhanced multilingual performance" },
      { version: "mistral-large-2402", date: "February 2024", notes: "Initial Mistral Large release" },
      { version: "mistral-medium", date: "December 2023", notes: "Mid-tier offering" },
      { version: "mistral-7b-instruct", date: "September 2023", notes: "Open-weight 7B model" }
    ]
  },
  {
    slug: "grok",
    name: "Grok",
    provider: "xAI",
    currentVersion: "grok-2-1212",
    releaseDate: "November 2023",
    description: "xAI's conversational AI with real-time X (Twitter) integration and distinctive personality, designed for wit and directness.",
    pricing: "X Premium+ subscription",
    benchmarks: [
      { name: "MMLU", score: "87.5%" },
      { name: "HumanEval", score: "74.1%" },
      { name: "GSM8K", score: "90.0%" },
      { name: "MATH", score: "52.8%" }
    ],
    versionHistory: [
      { version: "grok-2-1212", date: "December 2024", notes: "Vision capabilities, improved reasoning" },
      { version: "grok-2-0806", date: "August 2024", notes: "Significant capability improvements" },
      { version: "grok-1.5", date: "March 2024", notes: "128K context window" },
      { version: "grok-1", date: "November 2023", notes: "Initial release" }
    ]
  }
];
