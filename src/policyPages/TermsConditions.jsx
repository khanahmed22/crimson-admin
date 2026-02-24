import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function MerchantTermsAndConditions() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">
          Merchant Terms & Conditions
        </h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 2025
        </p>

        <div className="space-y-8">
          {/* 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              1. Merchant Account & Eligibility
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                To use the Crimson Castle Shop merchant platform, you must operate a
                legitimate business and provide accurate, complete, and current
                registration information.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activity conducted under your
                account.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              2. Subscription & Billing
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Subscription fees are billed in advance on a recurring basis.
                By subscribing, you authorize automatic charges using your
                selected payment method.
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  Subscriptions may be cancelled at any time in accordance with
                  our{" "}
                  <Link
                    to="/cancellation-policy"
                    className="text-primary hover:underline"
                  >
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  Refund eligibility is governed by our{" "}
                  <Link
                    to="/merchant-refund-policy"
                    className="text-primary hover:underline"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  Pricing may change with prior notice before renewal
                </li>
              </ul>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              3. Commissions & Fees
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Crimson Castle Shop may charge commissions and additional fees as
                displayed in your merchant dashboard.
              </p>
              <p>
                Fees already incurred are non-refundable except where required
                by applicable law.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              4. Merchant Responsibilities
            </h2>
            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
              <li>Accurate menu and pricing information</li>
              <li>Order fulfillment and customer service</li>
              <li>Compliance with food safety and legal regulations</li>
              <li>Protection of customer data and privacy</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              5. Prohibited Conduct
            </h2>
            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
              <li>Fraud, chargeback abuse, or deceptive practices</li>
              <li>Illegal or unauthorized activity</li>
              <li>Bypassing platform fees or security</li>
              <li>Harassment or abuse of users or staff</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              6. Cancellation & Termination
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                You may cancel your subscription at any time. Cancellation
                prevents future renewals and is handled according to our
                Cancellation Policy.
              </p>
              <p>
                We may suspend or terminate accounts for violations of these
                terms, non-payment, or unlawful activity.
              </p>
              <p>
                Refunds following termination are evaluated on a case-by-case
                basis and issued where required by applicable law.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              7. Liability & Indemnification
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                The platform is provided “as is”. Crimson Castle Shop is not
                responsible for merchant operations, food quality, or customer
                disputes.
              </p>
              <p>
                You agree to indemnify Crimson Castle Shop against claims arising
                from your business operations or violations of these terms.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              8. Governing Law & Disputes
            </h2>
            <p className="text-muted-foreground">
              These terms are governed by applicable local laws. Disputes will
              be resolved through good-faith discussions before pursuing formal
              legal remedies.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the
              platform constitutes acceptance of updated terms.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4">
              10. Contact
            </h2>
            <p className="text-muted-foreground">
              Email: support@crimsoncastle.biz<br />
              Phone: +92 (334)-820-4806<br />
              Hours: Monday–Friday, 9 AM–6 PM (PKT)
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            By using the Crimson Castle Shop platform, you agree to these Merchant
            Terms & Conditions.
          </p>
        </div>
      </div>
    </main>
  );
}
