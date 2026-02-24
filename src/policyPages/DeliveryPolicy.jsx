import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

export default function DeliveryPolicy() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Back to Home
        </Link>

        <div className="bg-card rounded-lg shadow-sm p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Delivery & Service Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 2025
          </p>
          

          <div className="prose prose-invert max-w-none space-y-8">
            {/* 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Digital Service Delivery
              </h2>
              <p>
                Crimson Castle Shop provides a fully digital Software-as-a-Service
                (SaaS) platform. No physical goods are shipped or delivered.
                Access to the service is provided electronically through web
                and mobile applications immediately after successful
                subscription activation.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Subscription-Based Access
              </h2>
              <p>
                Active subscription is required to access Crimson Castle Shop
                features, including order management, analytics, inventory
                tools, and configuration settings. Subscription access remains
                available for the duration of the paid billing period unless
                cancelled.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Cloud-Based Platform
              </h2>
              <p>
                The platform is hosted on secure cloud infrastructure and is
                accessible from any compatible device with an internet
                connection. All updates, improvements, and security patches are
                deployed automatically without merchant intervention.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Service Availability
              </h2>
              <p>
                Crimson Castle Shop strives to provide high service availability.
                Temporary interruptions may occur due to maintenance, updates,
                or unforeseen technical issues. Scheduled maintenance will be
                communicated in advance whenever reasonably possible.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Updates & Feature Enhancements
              </h2>
              <p>
                As part of the SaaS model, Crimson Castle Shop continuously improves
                its platform. Feature availability may vary by subscription
                tier, and certain features may be modified or discontinued with
                prior notice.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Billing, Refunds & Cancellations
              </h2>
              <p>
                Subscription billing, cancellation, and refund eligibility are
                governed by our{" "}
                <Link to="/merchant-refund-policy" className="text-primary">
                  Refund Policy
                </Link>{" "}
                and{" "}
                <Link to="/cancellation-policy" className="text-primary">
                  Cancellation Policy
                </Link>
                . Crimson Castle Shop does not provide refunds outside the conditions
                specified in those policies or where required by applicable law.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Support & Onboarding
              </h2>
              <p>
                Merchants receive onboarding assistance and technical support
                during active subscriptions. Support channels and response
                times may vary depending on subscription tier.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Data Storage & Retention
              </h2>
              <p>
                Merchant data is securely stored and backed up regularly.
                Upon subscription cancellation, merchant data is retained for
                up to 90 days to allow data export, after which it is
                permanently deleted unless retention is required by law.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Service Termination
              </h2>
              <p>
                Crimson Castle Shop may suspend or terminate access for violations
                of our{" "}
                <Link to="/terms-and-conditions" className="text-primary">
                  Terms & Conditions
                </Link>
                , non-payment, or unlawful use, in accordance with applicable
                laws.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                10. Contact Information
              </h2>
              <p className="font-semibold">
                Email: support@crimsoncastle.biz
                <br />
                Phone: +92 (334)-820-4806
                <br />
                Hours: Monday–Friday, 9 AM–6 PM (PKT)
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
