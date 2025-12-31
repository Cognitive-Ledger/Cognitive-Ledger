import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

export default function TermsOfService() {
  return (
    <Layout>
      <Helmet>
        <title>Terms of Service | Cognitive Ledger</title>
        <meta name="description" content="Read Cognitive Ledger's terms of service governing your use of our platform and services." />
      </Helmet>

      <article className="container max-w-3xl py-12">
        <header className="mb-12">
          <h1 className="headline-hero text-headline mb-4">Terms of Service</h1>
          <p className="text-caption">Last updated: December 31, 2024</p>
        </header>

        <div className="prose prose-lg max-w-none space-y-8 text-body-text">
          <section>
            <h2 className="headline-secondary text-headline mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Cognitive Ledger, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              Cognitive Ledger provides independent journalism covering artificial intelligence research, policy, and industry developments. Our services include articles, newsletters, podcasts, and premium content.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">3. User Accounts</h2>
            <p className="leading-relaxed mb-4">
              To access certain features, you may need to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">4. Subscriptions and Payments</h2>
            <p className="leading-relaxed mb-4">
              Premium subscriptions are billed on a recurring basis. By subscribing, you authorize us to charge your payment method. Subscriptions auto-renew unless cancelled before the renewal date.
            </p>
            <p className="leading-relaxed">
              Refunds are provided at our discretion and in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">5. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on Cognitive Ledger, including articles, graphics, logos, and software, is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">6. User Conduct</h2>
            <p className="leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use our services for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt our services</li>
              <li>Transmit viruses or malicious code</li>
              <li>Scrape or collect data without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">7. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Cognitive Ledger is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">8. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">9. Contact</h2>
            <p className="leading-relaxed">
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:legal@cognitiveledger.com" className="text-primary hover:underline">
                legal@cognitiveledger.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
}
