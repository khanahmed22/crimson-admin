import { useState, useEffect } from "react";
import { supabase } from "../db/supabase";
import { useAuth } from "@/store/authStore";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Title } from "react-head";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  // Handle password recovery event (if triggered after email link)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          const newPassword = prompt("Enter your new password:");
          if (newPassword) {
            const { error } = await supabase.auth.updateUser({
              password: newPassword,
            });
            if (error) {
              toast.error("There was an error updating your password.");
            } else {
              toast.success("Password updated successfully!");
              navigate("/login");
            }
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  
  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/new-password`, 
      });
      if (error) throw error;
      toast.success("Recovery email sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send recovery email.");
    } finally {
      setIsLoading(false);
      
    }
  };

  if (session) {
    return (
      <div>
        <Title>Forgot Password</Title>
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-center font-bold text-[--text-color]">
          You are Already Signed In!
        </h2>
      </div>
      </div>
    );
  }

  return (
    <div>
      <Title>Forgot Password</Title>
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-red-100/20 to-pink-100/20"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl max-md:text-xl font-bold text-gray-800 mb-2">
              Password Recovery
            </h1>
            <p className="text-gray-600">
              A recovery email will be sent to you.
            </p>
          </div>

          <form onSubmit={handleForgetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-accent text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending Email...
                </div>
              ) : (
                "Send Email"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
