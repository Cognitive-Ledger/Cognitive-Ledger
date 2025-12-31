import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Users, Target, Lightbulb, Shield } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <Helmet>
        <title>About Us | Cognitive Ledger</title>
        <meta name="description" content="Learn about Cognitive Ledger, your source for independent journalism covering artificial intelligence research, policy, and industry developments." />
      </Helmet>

      <article className="container max-w-4xl py-12">
        <header className="mb-16 text-center">
          <h1 className="headline-hero text-headline mb-6">About Cognitive Ledger</h1>
          <p className="text-xl text-body-text max-w-2xl mx-auto leading-relaxed">
            Independent journalism at the intersection of artificial intelligence and society. We believe informed citizens make better decisions about the technologies shaping our future.
          </p>
        </header>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-secondary/50 p-8 rounded-lg border border-divider">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h2 className="headline-tertiary text-headline">Our Mission</h2>
              </div>
              <p className="text-body-text leading-relaxed">
                To provide accurate, insightful, and accessible coverage of artificial intelligence developments. We cut through the hype and fear to deliver journalism that helps you understand what's really happening in AI.
              </p>
            </div>

            <div className="bg-secondary/50 p-8 rounded-lg border border-divider">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="headline-tertiary text-headline">Our Approach</h2>
              </div>
              <p className="text-body-text leading-relaxed">
                We combine deep technical expertise with accessible writing. Our team includes AI researchers, technology journalists, and policy experts who translate complex developments into clear, actionable insights.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="headline-secondary text-headline mb-8 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Accuracy", desc: "Rigorous fact-checking and expert review" },
              { icon: Users, title: "Accessibility", desc: "Complex topics made understandable" },
              { icon: Target, title: "Independence", desc: "No corporate influence on our coverage" },
              { icon: Lightbulb, title: "Insight", desc: "Analysis that goes beyond headlines" },
            ].map((value) => (
              <div key={value.title} className="text-center p-6">
                <div className="inline-flex p-3 bg-secondary rounded-full mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-headline mb-2">{value.title}</h3>
                <p className="text-sm text-caption">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="headline-secondary text-headline mb-8 text-center">Our Team</h2>
          <div className="bg-secondary/30 p-8 rounded-lg border border-divider text-center">
            <p className="text-body-text leading-relaxed max-w-2xl mx-auto">
              Cognitive Ledger is powered by a distributed team of journalists, researchers, and technologists passionate about making AI understandable. Our contributors span academia, industry, and policy institutions worldwide.
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/20">
            <h2 className="headline-tertiary text-headline mb-4">Get in Touch</h2>
            <p className="text-body-text mb-6">
              Have a story tip, feedback, or partnership inquiry? We'd love to hear from you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity"
            >
              Contact Us
            </a>
          </div>
        </section>
      </article>
    </Layout>
  );
}
