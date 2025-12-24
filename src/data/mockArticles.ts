export interface Article {
  slug: string;
  category: string;
  headline: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl?: string;
  isBreaking?: boolean;
  simpleContent: string;
  technicalContent: string;
  businessImpact: { level: "low" | "medium" | "high"; description: string };
  technicalImpact: { level: "low" | "medium" | "high"; description: string };
  ethicalRisk: { level: "low" | "medium" | "high"; description: string };
}

export const mockArticles: Article[] = [
  {
    slug: "anthropic-claude-4-release",
    category: "Models & Tools",
    headline: "Anthropic Releases Claude 4, Claims Significant Reasoning Improvements Over Predecessors",
    excerpt: "The latest iteration of Anthropic's flagship AI model demonstrates enhanced performance across multiple benchmarks while introducing new safety features designed to reduce harmful outputs.",
    author: "Sarah Chen",
    date: "December 24, 2024",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    isBreaking: true,
    simpleContent: `Anthropic, one of the leading AI companies, has released a new version of their AI assistant called Claude 4. This update makes the AI better at understanding complex questions and providing accurate answers.

The company says Claude 4 is particularly good at tasks that require multiple steps of reasoning, like solving math problems or analyzing long documents. They've also added new safety features to help prevent the AI from providing harmful information.

For everyday users, this means Claude 4 should be more helpful and reliable when answering questions or helping with tasks. The improvements are especially noticeable when dealing with nuanced topics that require careful consideration.`,
    technicalContent: `Anthropic has released Claude 4, featuring significant architectural improvements in its transformer-based language model. Key technical advancements include:

**Architecture Changes:**
- Extended context window to 200K tokens
- Improved attention mechanisms for better long-range dependency modeling
- New constitutional AI training methodology with refined RLHF pipelines

**Benchmark Performance:**
- MMLU: 89.2% (up from 86.8%)
- HumanEval: 78.4% (up from 73.2%)
- GSM8K: 94.1% (up from 91.5%)

**Safety Improvements:**
- Reduced jailbreak success rate by 40%
- Improved refusal calibration to reduce false positives
- Enhanced output filtering for harmful content

The model utilizes a mixture-of-experts architecture with dynamic routing, enabling more efficient compute utilization during inference.`,
    businessImpact: {
      level: "high",
      description: "Major competitive pressure on OpenAI and Google. Enterprise adoption likely to accelerate."
    },
    technicalImpact: {
      level: "high",
      description: "Significant advancement in reasoning capabilities with practical applications across industries."
    },
    ethicalRisk: {
      level: "medium",
      description: "Improved safety features, but increased capability raises dual-use concerns."
    }
  },
  {
    slug: "eu-ai-act-enforcement-begins",
    category: "Policy & Ethics",
    headline: "EU AI Act Enforcement Begins: What Companies Need to Know About New Compliance Requirements",
    excerpt: "The European Union's comprehensive AI regulation enters its implementation phase, requiring significant operational changes for companies deploying AI systems in European markets.",
    author: "Marcus Weber",
    date: "December 23, 2024",
    readTime: "12 min read",
    imageUrl: "https://images.unsplash.com/photo-1529074739296-9f4c0b1e5c16?w=1200&h=800&fit=crop",
    simpleContent: `The European Union has started enforcing its new AI Act, which is a set of rules that companies must follow when using AI in Europe. This is the world's first comprehensive law specifically for artificial intelligence.

The rules divide AI systems into different risk categories. High-risk AI—like systems used in hiring decisions or medical diagnosis—will need to meet strict requirements including human oversight and transparency about how they work.

Companies that don't follow these rules could face significant fines, up to 7% of their global revenue for the most serious violations.`,
    technicalContent: `The EU AI Act enforcement introduces a risk-based regulatory framework with specific technical requirements:

**Risk Classification:**
- Unacceptable Risk: Banned (social scoring, real-time biometric surveillance)
- High Risk: Strict requirements (hiring, credit scoring, medical devices)
- Limited Risk: Transparency obligations
- Minimal Risk: No requirements

**Technical Compliance Requirements for High-Risk AI:**
- Risk management systems with continuous monitoring
- Data governance requirements including bias testing
- Technical documentation and audit trails
- Accuracy, robustness, and cybersecurity standards
- Human oversight mechanisms

**Implementation Timeline:**
- Prohibited AI: 6 months from entry into force
- GPAI requirements: 12 months
- High-risk AI: 36 months

Companies must establish conformity assessment procedures and maintain technical documentation accessible to regulators.`,
    businessImpact: {
      level: "high",
      description: "Significant compliance costs for companies operating in EU. May reshape global AI governance standards."
    },
    technicalImpact: {
      level: "medium",
      description: "New documentation and monitoring requirements. May slow deployment of certain AI applications."
    },
    ethicalRisk: {
      level: "low",
      description: "Regulation aims to reduce AI-related harms. Sets precedent for rights-respecting AI development."
    }
  },
  {
    slug: "deepmind-protein-structure-breakthrough",
    category: "Research",
    headline: "DeepMind's AlphaFold 3 Predicts Protein-Drug Interactions with Unprecedented Accuracy",
    excerpt: "The latest version of DeepMind's protein structure prediction system extends beyond proteins to model interactions with drugs, DNA, and RNA, potentially accelerating pharmaceutical research.",
    author: "Dr. Emily Watson",
    date: "December 22, 2024",
    readTime: "10 min read",
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=800&fit=crop",
    simpleContent: `DeepMind, Google's AI research lab, has released an improved version of their famous AlphaFold system. AlphaFold 3 can now predict how drugs interact with proteins in the body, not just the shape of proteins themselves.

This is important for developing new medicines. Currently, scientists spend years testing how potential drugs might interact with specific proteins. AlphaFold 3 could significantly speed up this process by providing accurate predictions in hours instead of months.

The system is being made available to researchers worldwide, which could accelerate the development of treatments for various diseases.`,
    technicalContent: `AlphaFold 3 represents a significant evolution in computational biology, extending beyond protein structure prediction to model biomolecular complexes:

**Technical Innovations:**
- Diffusion-based architecture replacing previous Evoformer approach
- Joint modeling of proteins, nucleic acids, and small molecules
- Improved accuracy in protein-ligand binding prediction

**Performance Metrics:**
- PoseBusters benchmark: 76.8% success rate (vs. 52% for previous best)
- Protein-DNA/RNA interface prediction: 0.73 TM-score average
- Drug binding pocket identification: 89% accuracy

**Architecture Details:**
- End-to-end diffusion process for structure generation
- Cross-attention mechanisms for multi-molecule interactions
- Integration of molecular dynamics constraints

**Limitations:**
- Computationally intensive for large complexes
- Accuracy varies for flexible binding sites
- Requires validation for novel drug scaffolds`,
    businessImpact: {
      level: "high",
      description: "Could reduce pharmaceutical R&D costs by billions. Major implications for drug discovery timelines."
    },
    technicalImpact: {
      level: "high",
      description: "Paradigm shift in computational drug design. Enables new research methodologies."
    },
    ethicalRisk: {
      level: "low",
      description: "Accelerates beneficial medical research. Open access promotes equitable advancement."
    }
  },
  {
    slug: "openai-nonprofit-transition",
    category: "Companies",
    headline: "OpenAI Announces Plans to Complete Transition to For-Profit Structure by 2026",
    excerpt: "The AI research company confirms its restructuring timeline, sparking debate about the implications for its stated mission of ensuring artificial general intelligence benefits humanity.",
    author: "James Morrison",
    date: "December 21, 2024",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=800&fit=crop",
    simpleContent: `OpenAI, the company behind ChatGPT, has announced it will complete its transition from a nonprofit to a for-profit company by 2026. This change has been years in the making and raises questions about how the company will balance making money with its original mission.

When OpenAI was founded, it was a nonprofit focused on making sure advanced AI would benefit everyone. The company says this mission won't change, but critics worry that profit motives could take priority over safety and public benefit.

Supporters of the change argue that becoming for-profit allows OpenAI to raise the money needed to compete with other major tech companies in developing advanced AI.`,
    technicalContent: `OpenAI's corporate restructuring involves complex legal and organizational changes:

**Current Structure:**
- OpenAI Inc. (501(c)(3) nonprofit) controls OpenAI Global LLC
- Capped-profit structure limits investor returns to 100x
- Microsoft holds 49% stake in commercial operations

**Proposed Changes:**
- Conversion to public benefit corporation (PBC)
- Removal of profit caps
- New governance structure maintaining mission alignment

**Implications for Research:**
- Potential acceleration of commercialization priorities
- Questions about safety research resource allocation
- Impact on open publication policies

**Industry Context:**
- Anthropic maintains C-corp with Long-Term Benefit Trust
- DeepMind fully integrated into Alphabet
- xAI operates as standard corporation`,
    businessImpact: {
      level: "high",
      description: "May enable larger capital raises. Could affect competitive dynamics in AI industry."
    },
    technicalImpact: {
      level: "medium",
      description: "Potential shift in research priorities. May affect open-source contributions."
    },
    ethicalRisk: {
      level: "medium",
      description: "Concern about mission drift. Governance changes may reduce safety emphasis."
    }
  },
  {
    slug: "nvidia-blackwell-chip-delays",
    category: "Companies",
    headline: "Nvidia Acknowledges Blackwell GPU Delays, Cites Manufacturing Challenges",
    excerpt: "The AI chip giant reports production issues with its next-generation Blackwell architecture, potentially affecting availability of high-performance AI training hardware through mid-2025.",
    author: "Kevin Park",
    date: "December 20, 2024",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
    simpleContent: `Nvidia, the company that makes most of the computer chips used to train AI systems, has announced delays in its newest chip called Blackwell. These chips were supposed to be available sooner, but manufacturing problems have pushed back the timeline.

This matters because major AI companies like OpenAI, Google, and Meta rely on these chips to train their AI models. Delays could slow down the development of new AI systems across the industry.

Nvidia says it's working to resolve the issues and expects to begin shipping the new chips in limited quantities by early 2025, with full production by mid-2025.`,
    technicalContent: `Nvidia's Blackwell architecture delays stem from multiple technical challenges:

**Manufacturing Issues:**
- TSMC 3nm process yield problems
- CoWoS packaging constraints
- NVLink 5.0 interconnect testing failures

**Blackwell Specifications (B200):**
- 208 billion transistors
- 4nm TSMC process (revised from 3nm)
- 192GB HBM3e memory
- 8 petaflops FP8 performance
- 1800W TDP for dual-GPU configuration

**Impact Assessment:**
- H100 production increased to meet demand gap
- Cloud providers adjusting capacity planning
- AI training pipeline delays for major labs

**Competitive Implications:**
- AMD MI350 timeline unaffected
- Intel Falcon Shores maintains 2025 roadmap
- Custom silicon efforts from Google, Amazon may accelerate`,
    businessImpact: {
      level: "high",
      description: "Supply constraints may slow AI infrastructure buildout. Affects hyperscaler capex plans."
    },
    technicalImpact: {
      level: "medium",
      description: "Training workloads may shift to existing hardware. Efficiency optimizations become critical."
    },
    ethicalRisk: {
      level: "low",
      description: "No direct ethical implications. May slow overall AI capability advancement."
    }
  },
  {
    slug: "ai-agents-workplace-study",
    category: "Research",
    headline: "Stanford Study Finds AI Agents Reduce Knowledge Worker Productivity in Complex Tasks",
    excerpt: "Contrary to industry expectations, research shows that autonomous AI agents may hinder rather than help when handling nuanced workplace assignments requiring judgment.",
    author: "Dr. Rachel Torres",
    date: "December 19, 2024",
    readTime: "9 min read",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop",
    simpleContent: `A new study from Stanford University found surprising results about AI assistants in the workplace. While AI agents can help with simple, repetitive tasks, they may actually make workers less productive when dealing with complex problems.

The researchers studied workers using AI agents for tasks like analyzing documents, making decisions, and solving problems. They found that workers often spent more time correcting AI mistakes than they would have spent doing the work themselves.

The study suggests that AI works best when used as a tool that humans control, rather than as an autonomous agent that makes decisions on its own.`,
    technicalContent: `Stanford's Human-Centered AI Institute conducted a rigorous study on AI agent productivity:

**Methodology:**
- 500 participants across finance, consulting, and tech sectors
- Randomized controlled trial comparing human-only, AI-assisted, and AI-agent conditions
- Task complexity measured via cognitive load assessment

**Key Findings:**
- Simple tasks: AI agents improved productivity by 28%
- Moderate complexity: Marginal improvement (3-5%)
- High complexity: 15% productivity decrease with autonomous agents
- Error correction time exceeded task completion savings

**Factors Contributing to Decreased Performance:**
- Context switching between oversight and primary work
- Cascading errors from autonomous decision chains
- Trust calibration failures leading to over-reliance

**Recommendations:**
- Human-in-the-loop architectures for complex workflows
- Clear delineation of agent autonomy boundaries
- Improved uncertainty quantification in agent outputs`,
    businessImpact: {
      level: "medium",
      description: "May temper enterprise AI agent adoption. Affects ROI calculations for automation investments."
    },
    technicalImpact: {
      level: "medium",
      description: "Highlights need for better human-AI collaboration frameworks. Informs system design priorities."
    },
    ethicalRisk: {
      level: "low",
      description: "Supports measured approach to workplace automation. Validates human oversight importance."
    }
  }
];

export const breakingNews = [
  {
    id: "1",
    headline: "Anthropic Releases Claude 4 with Enhanced Reasoning Capabilities",
    slug: "anthropic-claude-4-release"
  },
  {
    id: "2",
    headline: "EU AI Act Enforcement Phase Officially Begins Today",
    slug: "eu-ai-act-enforcement-begins"
  },
  {
    id: "3",
    headline: "Nvidia Reports Blackwell GPU Production Delays Through Q2 2025",
    slug: "nvidia-blackwell-chip-delays"
  }
];

export const dailyBriefItems = [
  {
    category: "Models",
    text: "Anthropic releases Claude 4 with 200K context window and improved reasoning benchmarks across MMLU and HumanEval."
  },
  {
    category: "Policy",
    text: "EU AI Act enters enforcement phase. Companies have 6-36 months to comply depending on risk classification."
  },
  {
    category: "Research",
    text: "DeepMind's AlphaFold 3 achieves 76.8% success rate on protein-drug interaction prediction benchmark."
  },
  {
    category: "Industry",
    text: "OpenAI confirms 2026 timeline for completing transition to for-profit corporate structure."
  },
  {
    category: "Hardware",
    text: "Nvidia acknowledges Blackwell GPU delays, increases H100 production to bridge supply gap."
  },
  {
    category: "Research",
    text: "Stanford study finds AI agents reduce productivity on complex knowledge work tasks by 15%."
  }
];
