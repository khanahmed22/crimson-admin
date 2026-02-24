import { useState} from "react";
import { supabase } from "../db/supabase";
import { useAuth } from "@/store/authStore";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Title } from "react-head";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchSession, session } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
    const [error, setError] = useState("");
  
  

  
  const handleSignIn = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("")

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    const user = signInData.user;
    if (!user) {
      toast.error("No user found.");
      setIsLoading(false);
      return;
    }

    await fetchSession();

    toast.success("Signed in successfully!");
    setIsLoading(false);
    navigate("/dashboard");
  };

  if (session) {
    return (
      <div>
        <Title>Already Signed In</Title>
        <div className="min-h-screen">
          <h2 className="text-center font-bold text-[--text-color]">
            You are Already Signed In!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title>Sign In</Title>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-red-100/20 to-pink-100/20"></div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl max-md:text-xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition-all"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

            

              <button
                type="submit"
                disabled={isLoading }
                className="w-full btn-accent text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/sign-up")}
                  className="text-accent hover:underline font-medium"
                >
                  Sign up here
                </button>
              </p>
              <button
                className="text-sm text-pink-600"
                onClick={() => navigate("/password-recovery")}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
