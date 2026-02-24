import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function MerchantRefundPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-10">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Merchant Refund Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: December 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-4 text-base leading-relaxed">
            <p>
              This Merchant Refund Policy explains how refunds, cancellations,
              and billing disputes are handled for subscriptions and services
              purchased through Crimson Castle Shop. By purchasing a subscription
              or service, you agree to the terms outlined in this policy.
            </p>
          </section>

          {/* Refund Eligibility */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Refund Eligibility</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p>
                You may request a refund within <strong>14 days</strong> of the
                initial purchase or subscription charge.
              </p>
              <p>
                Refund requests submitted after the 14-day period may be denied,
                except where required by applicable consumer protection laws.
              </p>
              <p>
                Refunds may be refused in cases of suspected fraud, abuse of the
                refund system, or violation of our terms.
              </p>
            </div>
          </section>

          {/* Subscription Cancellations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              2. Subscription Cancellations
            </h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p>
                You may cancel your subscription at any time through your account
                settings.
              </p>
              <p>
                If you cancel within 14 days of the initial purchase, you may be
                eligible for a full refund.
              </p>
              <p>
                After 14 days, cancellation will take effect at the end of the
                current billing cycle. No refunds are provided for unused
                portions of the subscription period.
              </p>
            </div>
          </section>

          {/* Non-Refundable Items */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Non-Refundable Items</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p>The following items are generally non-refundable:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Transaction and payment processing fees</li>
                <li>Delivery fees and commissions already processed</li>
                <li>Custom development or consulting services</li>
                <li>Marketing or promotional services</li>
                <li>API usage fees</li>
                <li>
                  Add-ons or feature upgrades not cancelled within 14 days
                </li>
              </ul>
            </div>
          </section>

          {/* Refund Process */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              4. Refund Request Process
            </h2>
            <div className="space-y-3 text-base leading-relaxed">
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Log in to your merchant account</li>
                <li>Go to Account Settings → Billing</li>
                <li>Submit a refund or cancellation request</li>
                <li>Provide any requested supporting information</li>
              </ol>
              <p>
                Approved refunds are issued to the original payment method.
                Processing times may vary depending on your bank or payment
                provider.
              </p>
            </div>
          </section>

          {/* Chargebacks */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Chargebacks</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p>
                We encourage you to contact our support team before initiating a
                chargeback. Unresolved chargebacks may result in account
                suspension, additional fees, or loss of refund eligibility.
              </p>
            </div>
          </section>

          {/* Special Circumstances */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              6. Special Circumstances
            </h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p>
                Refunds related to service outages, billing errors, or permanent
                business closure are evaluated on a case-by-case basis.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Contact Support</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <ul className="space-y-2 ml-2">
                <li>
                  <strong>Email:</strong> support@crimsoncastle.biz
                </li>
                <li>
                  <strong>Phone:</strong> +92 (334)-820-4806
                </li>
                <li>
                  <strong>Hours:</strong> Monday–Friday, 9 AM–6 PM (PKT)
                </li>
              </ul>
            </div>
          </section>

          {/* Changes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Policy Changes</h2>
            <p className="text-base leading-relaxed">
              We may update this Refund Policy from time to time. Continued use
              of the platform after changes are posted constitutes acceptance of
              the updated policy.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-border pt-8 mt-12">
            <p className="text-sm text-muted-foreground">
              This policy applies to all merchant subscriptions and services
              offered by Crimson Castle Shop.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
