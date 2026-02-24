import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, ArrowLeft, Send } from "lucide-react";
import * as Yup from "yup";


export default function ContactUs() {
  const [result, setResult] = useState("");

  const contactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .required("Name is required"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  message: Yup.string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message is too long")
    .required("Message is required"),
});
const [errors, setErrors] = useState({});
  const onSubmit = async (event) => {
  event.preventDefault();
  setResult("");

  const formData = new FormData(event.target);

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  try {
    await contactSchema.validate(data, { abortEarly: false });
    setErrors({});

    setResult("Sending....");

    formData.append("access_key", import.meta.env.VITE_WEB3_KEY);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const res = await response.json();

    if (res.success) {
      setResult("Message Sent!");
      event.target.reset();
    } else {
      setResult("Error submitting form");
    }
  } catch (validationError) {
    const formattedErrors = {};

    validationError.inner?.forEach((err) => {
      formattedErrors[err.path] = err.message;
    });

    setErrors(formattedErrors);
  }
};

  

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-balance">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Have questions or need help? We're here to assist you. Reach out
              to our team and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Info Cards */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-heading">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <a
                  href="mailto:support@crimsoncastle.biz"
                  className="flex flex-col gap-y-3 text-foreground hover:text-primary transition-colors font-medium"
                >
                  <span>info@crimsoncastle.biz</span> 
                </a>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="font-heading">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <a
                  href="tel:+923348204806"
                  className="block text-foreground hover:text-secondary transition-colors font-medium"
                >
                  +92 (334)-820-4806
                </a>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday, 9 AM - 6 PM (PKT)
                </p>
              </CardContent>
            </Card>

            
          </div>

          {/* Contact Form */}
<div className="max-w-2xl mx-auto">
  <Card className="border-0 shadow-xl rounded-2xl">
    <CardHeader>
      <CardTitle className="font-heading text-2xl">Send us a Message</CardTitle>
      <CardDescription>
        Fill out the form below and we'll respond within 24 hours.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form onSubmit={onSubmit} className="space-y-5">

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
  id="name"
  name="name"
  required
  placeholder="John Doe"
  className="rounded-lg shadow-lg"
/>

{errors.name && (
  <p className="text-sm text-red-500">{errors.name}</p>
)}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
  id="email"
  name="email"
  type="email"
  required
  placeholder="you@example.com"
  className="rounded-lg shadow-lg"
/>

{errors.email && (
  <p className="text-sm text-red-500">{errors.email}</p>
)}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
  id="message"
  name="message"
  required
  placeholder="Write your message here..."
  className="rounded-lg min-h-[120px] shadow-lg"
/>

{errors.message && (
  <p className="text-sm text-red-500">{errors.message}</p>
)}
        </div>

        <div className="flex items-center justify-center">
        
          <Button
            type="submit"
            className="w-fit bg-red-500 hover:bg-red-400 transition-all text-white rounded-xl py-2"
          >
            <Send/> Send Message
          </Button>
        </div>

        {/* Result Status */}
        {result && (
          <p className="text-sm text-center text-muted-foreground">{result}</p>
        )}
      </form>
    </CardContent>
  </Card>
</div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; 2026 CrimsonCastle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
