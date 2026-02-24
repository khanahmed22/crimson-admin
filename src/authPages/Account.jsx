import { useState} from "react";
import { useAuth } from "@/store/authStore";
import { User, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Title } from "react-head";
import { supabase } from "@/db/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { initPaddle } from "@/paddle";


export default function Account() {
  const { session } = useAuth();
  const email = session?.user?.email;
  const merchant_id = session?.user?.id;
  const [loading, setLoading] = useState(false);
  

  



  // ✅ Fetch merchant status
  const { data: merchantStatus, isPending } = useQuery({
    queryKey: ["merchantStatus", merchant_id],
    queryFn: async () => {
      if (!merchant_id) return null;

      const { data, error } = await supabase
        .from("merchant_accounts")
        .select("merchant_verify,plan,full_name")
        .eq("merchant_id", merchant_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!merchant_id,
    
    refetchOnWindowFocus: false,
  });

  // 🔎 Check active subscription
const { data: subscription } = useQuery({
  queryKey: ["subscription", merchant_id],
  queryFn: async () => {
    if (!merchant_id) return null;

    const { data, error } = await supabase
      .from("merchant_accounts")
      .select("subscription_id, plan")
      .eq("merchant_id", merchant_id)
      
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  enabled: !!merchant_id,
    refetchInterval: 3000
});


  // 🟢 Change plan button handler

  
  





const handlePaddleCheckout = async () => {
  try {
    setLoading(true);

    const paddle = await initPaddle(); // <-- get instance

    paddle.Checkout.open({
      items: [
        {
          priceId: import.meta.env.VITE_PADDLE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer: {
        email,
      },
      customData: {
        merchant_id,
      },
    });
  } catch (err) {
    console.error("Paddle checkout failed:", err);
    toast.error("Unable to start checkout");
  } finally {
    setLoading(false);
  }
};





const handleManageSubscription = async () => {

  if (!subscription?.subscription_id) {
    console.log('subscription_id missing')
    return
  };

  try {
    const res = await fetch(
      `${import.meta.env.VITE_CREATE_PADDLE_LINK}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          
          
        },
        
        body: JSON.stringify({
          subscription_id: subscription.subscription_id,
          merchant_id,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create portal session");
    }

    const { url } = await res.json();
    window.location.href = url;
  } catch (err) {
    console.error(err);
    toast.error("Unable to open subscription manager");
  }
};


const handleChangePlan = () => {
  if (merchantStatus?.plan === "free") {
     
    handlePaddleCheckout();
    return;
  }

  if (merchantStatus?.plan === "pro") {
   
    handleManageSubscription(); // opens Paddle portal
  }
};




  

  return (
    <div>
      <Title>Account</Title>

      <div className="min-h-screen flex flex-col items-center py-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-x-3">
          <div className="flex items-center justify-center mt-3 w-16 h-16 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            Account
          </h2>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md mt-3 rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="text-orange-500" />
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <h2 className="font-semibold text-gray-800 text-sm">
                {email}
              </h2>
            </div>
          </div>

          {/* Verification */}
          <div className="text-sm text-gray-600">
            Verification:{" "}
            <span className="font-semibold capitalize">
              {merchantStatus?.merchant_verify || "unverified"}
            </span>
          </div>

          {/* Plan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  merchantStatus?.plan === "pro"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {merchantStatus?.plan || "free"}
              </span>
            </div>

            <Button
              className="btn-accent"
              disabled={isPending}
              onClick={handleChangePlan}
            >
               {loading ? <Loader2 className="animate-spin"/> : 'Change Plan'} 
            </Button>
          </div>

          {/* Actions */}
          
        </div>
      </div>

      
    </div>
  );
}
