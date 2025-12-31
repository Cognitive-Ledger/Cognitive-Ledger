import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | Cognitive Ledger</title>
        <meta name="description" content="Cognitive Ledger's privacy policy explains how we collect, use, and protect your personal information." />
      </Helmet>

      <article className="container max-w-3xl py-12">
        <header className="mb-12">
          <h1 className="headline-hero text-headline mb-4">Privacy Policy</h1>
          <p className="text-caption">Last updated: December 31, 2024</p>
        </header>

        <div className="prose prose-lg max-w-none space-y-8 text-body-text">
          <section>
            <h2 className="headline-secondary text-headline mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              At Cognitive Ledger, we collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address</li>
              <li>Account credentials</li>
              <li>Payment information (processed securely by our payment providers)</li>
              <li>Communication preferences</li>
              <li>Any other information you choose to provide</li>
            </ul>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send newsletters, updates, and marketing communications</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">3. Information Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our website, conducting our business, or servicing you.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security measures designed to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">5. Your Rights</h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">6. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@cognitiveledger.com" className="text-primary hover:underline">
                privacy@cognitiveledger.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
}
