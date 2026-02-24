import { useState, useEffect } from "react"
import { supabase } from "../db/supabase"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Title } from "react-head"

export default function NewPassword() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  // ✅ Password rules
  const rules = [
    { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "At least one lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "At least one number", test: (pw) => /\d/.test(pw) },
    { label: "At least one special character (!@#$%^&*)", test: (pw) => /[!@#$%^&*]/.test(pw) },
  ]

  const allValid = rules.every((rule) => rule.test(newPassword))

  useEffect(() => {
    const handleRecovery = async () => {
      // 👇 Handle Supabase email link (contains #access_token)
      const hash = window.location.hash
      if (hash && hash.includes("access_token")) {
        try {
          await supabase.auth.exchangeCodeForSession(hash)
        } catch (err) {
          console.error("Error exchanging session:", err)
        }
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "PASSWORD_RECOVERY" && session) {
            setHasSession(true)
          }
        }
      )

      // Check if already logged in (session from email)
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setHasSession(true)
      }

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    handleRecovery()
  }, [])

  const handleNewPassword = async (e) => {
    e.preventDefault()

    if (!allValid) {
      toast.error("Password does not meet the requirements.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      toast.success("Password updated successfully!")
      navigate("/sign-in")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update password.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasSession) {
    return (
      <div>
        <Title>Error</Title>
        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-center font-bold text-[--text-color]">
            Invalid or expired link. Please request a new password reset.
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Title>Set New Password</Title>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-red-100/20 to-pink-100/20"></div>
        <div className="relative w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl max-md:text-xl font-bold text-gray-800 mb-2">
                Set New Password
              </h1>
              <p className="text-gray-600">Enter your new password below.</p>
            </div>

            <form onSubmit={handleNewPassword} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 pr-10 bg-white/50 border border-gray-200 rounded-xl"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password rules checklist */}
                {newPassword.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {rules.map((rule, i) => {
                      const valid = rule.test(newPassword)
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <span className={valid ? "text-green-600" : "text-red-500"}>
                            {valid ? "✅" : "❌"}
                          </span>
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-10 bg-white/50 border border-gray-200 rounded-xl"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className={`mt-2 text-sm ${
                      confirmPassword === newPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {confirmPassword === newPassword
                      ? "✅ Passwords match"
                      : "❌ Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !allValid || newPassword !== confirmPassword}
                className="w-full btn-accent text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
