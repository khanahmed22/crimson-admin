import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function Domain() {
  const [result, setResult] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);
    formData.append("access_key", import.meta.env.VITE_WEB3_DOMAIN_KEY);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      setResult("Request Submitted Successfully");
      event.target.reset();
    } else {
      setResult("Error");
    }
  };

  return (
    <form
  onSubmit={onSubmit}
  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5"
>
  <div className="space-y-1">
    
    <p className="text-sm text-gray-500">
      Only subdomains are allowed and must start with
      <span className="font-medium text-gray-800"> order.</span>
    </p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="domain" className="text-sm font-medium">
      Domain name
    </Label>
    <Input
      id="domain"
      type="text"
      name="domain"
      required
      placeholder="order.pizzatown.lol"
      className="h-11"
    />
    <p className="text-xs text-gray-400">
      Example: <span className="font-mono">order.pizzatown.lol</span>
    </p>
  </div>

  <Button type="submit" className="btn-accent w-full h-11">
    Submit for Approval
  </Button>

  {result && (
    <div className="text-sm text-center text-gray-700 bg-gray-50 border rounded-lg py-2">
      {result}
    </div>
  )}
</form>

  );
}