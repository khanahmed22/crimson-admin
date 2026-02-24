import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function CancellationPolicy() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Cancellation Policy
          </h1>
          <p className="text-muted-foreground">Last updated: December 2025</p>
        </div>

        <div className="space-y-8 text-foreground">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Cancellation Policy explains how merchants may cancel their
              subscriptions, how cancellation timing works, and when refunds
              may apply.
            </p>
          </section>

          {/* How to Cancel */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              How to Cancel Your Subscription
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You may cancel your subscription at any time through your
                account dashboard under <strong>Account → Billing</strong>.
              </p>
              <p className="text-muted-foreground">
                Cancellation prevents future renewals but does not immediately
                terminate access unless otherwise stated.
              </p>
            </div>
          </section>

          {/* Cooling-off Period */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              14-Day Cooling-Off Period
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you cancel within <strong>14 days</strong> of your initial
                subscription purchase, you may be eligible for a full refund.
              </p>
              <p className="text-muted-foreground">
                Refund eligibility during this period may be limited if the
                service has been extensively used, abused, or accessed in
                violation of our terms.
              </p>
            </div>
          </section>

          {/* After 14 Days */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Cancellation After 14 Days
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you cancel after the 14-day cooling-off period, your
                subscription will remain active until the end of the current
                billing cycle.
              </p>
              <p className="text-muted-foreground">
                No refunds are issued for unused time remaining in the billing
                period.
              </p>
            </div>
          </section>

          {/* Billing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Billing Cycle Considerations
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Subscriptions are billed in advance on a recurring basis.
                Cancelling prevents future charges but does not reverse charges
                already processed.
              </p>
              <p className="text-muted-foreground">
                You are responsible for cancelling before your next billing
                date to avoid renewal.
              </p>
            </div>
          </section>

          {/* Non-Refundable Items */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Non-Refundable Charges
            </h2>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Transaction and payment processing fees</li>
              <li>Fees for services already rendered</li>
              <li>Custom development or consulting services</li>
              <li>Usage-based fees already incurred</li>
            </ul>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Account Termination by Crimson Castle Shop
            </h2>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate accounts for violations of our terms,
              fraudulent activity, or non-payment.
            </p>
            <p className="text-muted-foreground">
              Refunds in such cases are not guaranteed and are evaluated on a
              case-by-case basis, where required by applicable law.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Data and Account Closure
            </h2>
            <p className="text-muted-foreground">
              After cancellation, account data is retained for a limited period
              for compliance and record-keeping purposes, after which it is
              securely deleted unless legally required otherwise.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Questions or Support
            </h2>
            <p className="text-muted-foreground">
              For assistance with cancellation, please contact{" "}
              <a
                href="mailto:support@crimsoncastle.biz"
                className="text-primary hover:underline"
              >
                support@crimsoncastle.biz
              </a>{" "}
              or call +92 (334)-820-4806. Support hours are Monday–Friday,
              9 AM–6 PM (PKT).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
