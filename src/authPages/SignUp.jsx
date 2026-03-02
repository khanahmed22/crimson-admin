import { useState } from "react";
import { supabase } from "../db/supabase";
import { useNavigate } from "react-router";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff, FlaskRound } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { Title } from "react-head";

export default function SignUp() {
  const [full_name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();




  // Password validation rules
  const rules = [
    { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "At least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "At least one number", test: (pw) => /\d/.test(pw) },
    {
      label: "At least one special character (!@#$%^&*)",
      test: (pw) => /[!@#$%^&*]/.test(pw),
    },
  ];

  const allValid = rules.every((rule) => rule.test(password));

  const handleSignUp = async () => {
  if (!agree) return setError("Accept Terms first");
  if (!allValid) return setError("Weak password");
  if (!full_name || !email) return setError("Fill all fields");

  setLoading(true);
  setError("");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://crimsoncastle.biz/sign-in",
      data: {
        full_name,
        role: "merchant", // ✅ SENT AT CREATION TIME
      },
    },
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  alert("Please check your inbox (and spam/junk folder) for a verification email to activate your account.");
  setLoading(false);
};



  if (session) {
    return (
      <div>
        <Title>Sign Up</Title>
        <div className="min-h-screen">
          <h2 className="text-center font-bold text-[--text-color]">
            You are already signed in!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title>Sign Up</Title>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl max-md:text-xl font-bold text-text mb-2">
                Create Merchant Account
              </h1>
              <p className="text-text/70 max-md:text-sm">
                Join our Crimson Community Today
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <Label className="block text-sm font-medium text-text mb-2">
                  Full Name
                </Label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={full_name}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  disabled={loading}
                  required
                />
              </div>

              

              {/* Email */}
              <div>
                <Label className="block text-sm font-medium text-text mb-2">
                  Email Address
                </Label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label className="block text-sm font-medium text-text mb-2">
                  Password
                </Label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password checklist */}
                {password.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {rules.map((rule, i) => {
                      const valid = rule.test(password);
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <span
                            className={
                              valid ? "text-green-600" : "text-red-500"
                            }
                          >
                            {valid ? "✅" : "❌"}
                          </span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Terms & Privacy Checkbox */}
              <div className="flex items-start gap-2 text-sm">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-accent cursor-pointer"
                  disabled={loading}
                />
                <label htmlFor="agree" className="text-text/80">
                  I agree to the{" "}
                  <a
                    href="/terms-conditions"
                    className="text-accent font-semibold hover:underline"
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="text-accent font-semibold hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              

              {/* Submit button */}
              <button
                onClick={handleSignUp}
                disabled={
                  loading ||
                  !email ||
                  !password ||
                  !full_name ||
                  !allValid ||
                  !agree 
                }
                className="w-full btn-accent py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-text/70">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/sign-in")}
                    className="text-accent font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
