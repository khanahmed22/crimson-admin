import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Merchant Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 2025
        </p>

        <div className="space-y-8">
          {/* 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Data Controller</h2>
            <p className="text-muted-foreground">
              Crimson Castle Shop (“we”, “us”, “our”) acts as the data
              controller for merchant information processed through the Crimson
              Castle Shop SaaS platform. We determine how and why merchant data
              is processed in accordance with applicable data protection laws.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We collect business, account, operational, and technical
              information necessary to provide and operate the platform,
              including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Business identity and contact details</li>
              <li>Subscription and billing information</li>
              <li>Order, transaction, and operational data</li>
              <li>Account credentials and access logs</li>
              <li>Device, browser, and IP address data</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              3. Legal Basis for Processing
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Performance of a contract (providing SaaS services)</li>
              <li>Compliance with legal and regulatory obligations</li>
              <li>Legitimate business interests (security, analytics)</li>
              <li>Your consent, where required</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              4. Payment & Financial Data
            </h2>
            <p className="text-muted-foreground">
              Payment processing is handled by third-party payment processors.
              Crimson Castle Shop does not store full payment card details.
              Financial information is processed securely in accordance with
              industry standards by authorized providers.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              5. How We Use Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain platform services</li>
              <li>Manage subscriptions, billing, and payouts</li>
              <li>Improve platform performance and features</li>
              <li>Ensure security and prevent fraud</li>
              <li>Provide customer and technical support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Data Sharing</h2>
            <p className="text-muted-foreground">
              We may share data with trusted service providers, payment
              processors, analytics partners, and authorities where legally
              required. We do not sell merchant data.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              7. International Data Transfers
            </h2>
            <p className="text-muted-foreground">
              Merchant data may be processed or stored outside your country of
              residence. Where international transfers occur, appropriate
              safeguards are applied to protect your information.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground">
              Data is retained while your account is active and for up to 90
              days after cancellation to allow data export and compliance.
              Financial records may be retained longer where legally required.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Merchant Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access and review your data</li>
              <li>Request corrections</li>
              <li>Request deletion (subject to legal limits)</li>
              <li>Export data</li>
              <li>Withdraw marketing consent</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Children’s Data</h2>
            <p className="text-muted-foreground">
              Crimson Castle Shop does not knowingly collect personal data from
              individuals under the age of 18.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Security Measures</h2>
            <p className="text-muted-foreground">
              We implement reasonable technical and organizational safeguards to
              protect merchant data. However, no system can guarantee absolute
              security.
            </p>
          </section>

         

          

          {/* 12 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground">
              Email: support@crimsoncastle.biz
              <br />
              Phone: +92 (334)-820-4806
              <br />
              Hours: Monday–Friday, 9 AM–6 PM (PKT)
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
