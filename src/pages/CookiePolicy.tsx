import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";

export default function CookiePolicy() {
  return (
    <Layout>
      <Helmet>
        <title>Cookie Policy | Cognitive Ledger</title>
        <meta name="description" content="Learn about how Cognitive Ledger uses cookies and similar technologies on our website." />
      </Helmet>

      <article className="container max-w-3xl py-12">
        <header className="mb-12">
          <h1 className="headline-hero text-headline mb-4">Cookie Policy</h1>
          <p className="text-caption">Last updated: December 31, 2024</p>
        </header>

        <div className="prose prose-lg max-w-none space-y-8 text-body-text">
          <section>
            <h2 className="headline-secondary text-headline mb-4">What Are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and understand how you interact with the site.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">How We Use Cookies</h2>
            <p className="leading-relaxed mb-4">Cognitive Ledger uses cookies for the following purposes:</p>
            
            <h3 className="headline-tertiary text-headline mt-6 mb-3">Essential Cookies</h3>
            <p className="leading-relaxed">
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access.
            </p>

            <h3 className="headline-tertiary text-headline mt-6 mb-3">Analytics Cookies</h3>
            <p className="leading-relaxed">
              We use analytics cookies to understand how visitors interact with our website. This helps us improve our content and user experience.
            </p>

            <h3 className="headline-tertiary text-headline mt-6 mb-3">Preference Cookies</h3>
            <p className="leading-relaxed">
              These cookies remember your preferences, such as reading mode settings and display preferences, to provide a more personalized experience.
            </p>

            <h3 className="headline-tertiary text-headline mt-6 mb-3">Marketing Cookies</h3>
            <p className="leading-relaxed">
              With your consent, we may use marketing cookies to deliver relevant advertisements and track the effectiveness of our marketing campaigns.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">Third-Party Cookies</h2>
            <p className="leading-relaxed">
              Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. The third parties include analytics providers and social media platforms.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">Managing Cookies</h2>
            <p className="leading-relaxed mb-4">You can control and manage cookies in several ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser settings: Most browsers allow you to refuse or delete cookies</li>
              <li>Our cookie preferences: You can adjust your preferences through our cookie settings</li>
              <li>Opt-out tools: Many advertising networks offer opt-out mechanisms</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Note that disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">Cookie Retention</h2>
            <p className="leading-relaxed">
              Different cookies have different retention periods. Session cookies are deleted when you close your browser, while persistent cookies remain until they expire or you delete them.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">Updates to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="headline-secondary text-headline mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about our use of cookies, please contact us at{" "}
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
