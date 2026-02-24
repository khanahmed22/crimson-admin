import { useNavigate } from "react-router"
import { ArrowLeftCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-black via-neutral-900 to-red-950 text-white px-6 relative overflow-hidden">
      {/* Red glow background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent_60%)]" />

      {/* Large 404 number */}
      <h1 className="text-7xl sm:text-8xl font-extrabold bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
        404
      </h1>

      {/* Message */}
      <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-md">
        Uh-oh! The page you’re looking for has gone up in flames 🔥  
      </p>

      {/* Button */}
      <div className="mt-8">
        <Button
          onClick={() => navigate("/")}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-3 text-base rounded-xl shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105"
        >
          <ArrowLeftCircle size={20} />
          Go Back Home
        </Button>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-gray-500">Stay cool. We’ll guide you home 😎</p>
    </div>
  )
}
