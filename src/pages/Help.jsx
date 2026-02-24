import TawkTo from "@/lib/tawkto";
import { MessageCircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Title } from "react-head";
export default function Help() {
  const openSupport = () => {
    if (window.Tawk_API) {
      window.Tawk_API.maximize();
    }
  };

  return (
    <div className="flex justify-center px-4 mt-10">
      <Title>Support</Title>
      <Card className="w-full max-w-lg rounded-2xl shadow-xl border">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 shadow-lg">
            <MessageCircleQuestionMark className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            Support
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Need assistance? Our support team is available to help you resolve
            issues, answer questions, and guide you through the platform.
          </p>

          {/* CTA */}
          <div className="mt-6">
            <Button
              onClick={openSupport}
              size="lg"
              className="w-full text-white rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90 transition"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      <TawkTo />
    </div>
  );
}
