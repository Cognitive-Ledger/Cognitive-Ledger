import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { CheckCircle, AlertCircle, Scale, Eye, Edit, Users } from "lucide-react";

export default function EditorialStandards() {
  return (
    <Layout>
      <Helmet>
        <title>Editorial Standards | Cognitive Ledger</title>
        <meta name="description" content="Our commitment to accuracy, fairness, and transparency in AI journalism." />
      </Helmet>

      <article className="container max-w-3xl py-12">
        <header className="mb-12">
          <h1 className="headline-hero text-headline mb-4">Editorial Standards</h1>
          <p className="text-xl text-body-text leading-relaxed">
            Our commitment to accuracy, fairness, and transparency in covering artificial intelligence.
          </p>
        </header>

        <div className="space-y-12 text-body-text">
          {/* Accuracy Section */}
          <section className="bg-secondary/30 p-8 rounded-lg border border-divider">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <h2 className="headline-secondary text-headline">Accuracy</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Accuracy is the foundation of our journalism. We are committed to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verifying all facts through multiple sources before publication</li>
                <li>Consulting domain experts for technical accuracy</li>
                <li>Clearly distinguishing between news, analysis, and opinion</li>
                <li>Promptly correcting errors when they occur</li>
                <li>Providing context for technical claims and research findings</li>
              </ul>
            </div>
          </section>

          {/* AI Usage Section */}
          <section className="bg-primary/5 p-8 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              <h2 className="headline-secondary text-headline">AI in Our Workflow</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-relaxed">
                As a publication covering AI, we practice transparency about our own AI usage:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI tools may assist with research, transcription, and drafting</li>
                <li>All published content is reviewed and edited by human journalists</li>
                <li>AI-generated summaries are clearly labeled</li>
                <li>We never publish AI-generated content without human verification</li>
                <li>Our editorial judgment remains entirely human-driven</li>
              </ul>
              <p className="text-sm text-caption mt-4 italic">
                "Human-edited. AI-assisted." — This isn't just our tagline, it's our commitment.
              </p>
            </div>
          </section>

          {/* Fairness Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="headline-secondary text-headline">Fairness & Balance</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-relaxed">
                We strive for fair and balanced reporting:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Presenting multiple perspectives on controversial topics</li>
                <li>Giving subjects of coverage opportunity to respond</li>
                <li>Avoiding sensationalism in headlines and coverage</li>
                <li>Acknowledging uncertainty and limitations in AI research</li>
                <li>Distinguishing between hype and genuine breakthroughs</li>
              </ul>
            </div>
          </section>

          {/* Independence Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h2 className="headline-secondary text-headline">Independence</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Editorial independence is essential to our credibility:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Our newsroom operates independently from business operations</li>
                <li>Advertisers and sponsors have no influence over our coverage</li>
                <li>We disclose any potential conflicts of interest</li>
                <li>Sponsored content is clearly labeled and separated from news</li>
              </ul>
            </div>
          </section>

          {/* Sources Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="headline-secondary text-headline">Sources & Attribution</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-relaxed">
                We maintain high standards for sourcing:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Primary sources are preferred over secondary reporting</li>
                <li>Anonymous sources are used sparingly and only when necessary</li>
                <li>We link to original research papers and documents when available</li>
                <li>Expert credentials and potential biases are disclosed</li>
              </ul>
            </div>
          </section>

          {/* Corrections Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <h2 className="headline-secondary text-headline">Corrections</h2>
            </div>
            <div className="space-y-4">
              <p className="leading-relaxed">
                When we make mistakes, we correct them promptly and transparently:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Corrections are clearly noted at the top of articles</li>
                <li>We explain what was incorrect and provide accurate information</li>
                <li>Significant corrections are announced to newsletter subscribers</li>
                <li>Our correction history is publicly accessible</li>
              </ul>
              <p className="mt-4">
                To report an error, email{" "}
                <a href="mailto:corrections@cognitiveledger.com" className="text-primary hover:underline">
                  corrections@cognitiveledger.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </article>
    </Layout>
  );
}
