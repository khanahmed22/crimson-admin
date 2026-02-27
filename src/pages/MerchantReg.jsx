import { useState, useEffect } from "react"
import { supabase } from "@/db/supabase"
import { useAuth } from "@/store/authStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function MerchantReg() {
  const { session } = useAuth()
  const [status, setStatus] = useState("loading")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    business_name: "",
    full_name: "",
    phone: "",
    category: "",
    description: "",
    address: "",
    cnic: "",
    social_links: "",
  })

  const [agree, setAgree] = useState(false)
  const [finalagree, setFinalAgree] = useState(false)

  // Fetch status
  useEffect(() => {
    if (!session?.user?.id) return

    async function fetchStatus() {
      const { data: merchant } = await supabase
        .from("merchant_accounts")
        .select("merchant_verify")
        .eq("merchant_id", session.user.id)
        .maybeSingle()

      const { data: appData } = await supabase
        .from("merchant_apps")
        .select("id")
        .eq("merchant_id", session.user.id)
        .maybeSingle()

      if (merchant?.merchant_verify === "verified") setStatus("verified")
      else if (appData) setStatus("submitted")
      else setStatus("idle")
    }

    fetchStatus()
  }, [session?.user?.id])

  async function handleSubmit() {
    if (!agree || !finalagree) return

    setLoading(true)

    try {
      if (!session?.user?.id || !session?.user?.email) {
        throw new Error("User not authenticated")
      }

      if (
        !form.full_name.trim() ||
        !form.phone.trim() ||
        !form.business_name.trim() ||
        !form.category.trim() ||
        !form.description.trim() ||
        !form.address.trim() ||
        !form.cnic.trim()
      ) {
        throw new Error("Please fill all required fields.")
      }

      const { error } = await supabase.from("merchant_apps").insert([
        {
          merchant_id: session.user.id,
          user_email: session.user.email,
          full_name: form.full_name,
          phone: form.phone,
          business_name: form.business_name,
          category: form.category,
          description: form.description,
          address: form.address,
          cnic: form.cnic,
          social_links: form.social_links,
        },
      ])

      if (error) throw error

      alert("✅ Application submitted successfully")
      setStatus("submitted")
    } catch (err) {
      console.error("Insert failed:", err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checklistItems = [
    "Kitchen is cleaned daily",
    "All surfaces and utensils are washed with soap",
    "Raw and cooked foods are stored separately",
    "Separate cutting boards for meat and vegetables",
    "Food containers are sealed and clean",
    "No insects or pests in the kitchen",
    "Hands are washed frequently during preparation",
    "Gloves used when required",
    "Hair is covered while cooking",
    "No sick person handles food",
    "Ingredients are fresh and not expired",
    "Perishables are refrigerated properly",
    "Food is cooked to safe temperatures",
    "Packaging is food-grade and sealed",
  ]

  // UI states
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center text-3xl min-h-screen">
        Loading...
      </div>
    )
  }

  if (status === "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-green-600">
            Approved ✅
          </h2>
          <p>Your home chef account has been approved.</p>
        </div>
      </div>
    )
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-yellow-600">
            Under Review ⏳
          </h2>
          <p>Your application is being reviewed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-8">
          Home Chef Registration
        </h1>

        <form className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Kitchen Name</Label>
            <Input
              placeholder="Enter your kitchen name"
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Your Full Name</Label>
            <Input
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="03XXXXXXXXX"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Food Category</Label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Category</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Bakery">Bakery</option>
              <option value="Cafe">Cafe</option>
              <option value="Desi Food">Desi Food</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Describe What You Cook</Label>
            <Textarea
              placeholder="Tell customers what makes your food special"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Area / Address</Label>
            <Textarea
              placeholder="Enter area (e.g. Gulshan Block 7, Karachi)"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>CNIC Number</Label>
            <Input
              placeholder="42101-XXXXXXX-X"
              value={form.cnic}
              onChange={(e) =>
                setForm({ ...form, cnic: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Social Media Links (Optional)</Label>
            <Textarea
              placeholder="Facebook / Instagram link"
              value={form.social_links}
              onChange={(e) =>
                setForm({ ...form, social_links: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2 border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3 text-center">
              Food Safety Declaration
            </h2>

            <div className="grid gap-2 text-sm">
              {checklistItems.map((item) => (
                <div key={item}>• {item}</div>
              ))}
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                checked={agree}
                onCheckedChange={(checked) => setAgree(!!checked)}
              />
              <span className="text-sm">
                I confirm that I follow these hygiene practices.
              </span>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center space-x-2">
            <Checkbox
              checked={finalagree}
              onCheckedChange={(checked) =>
                setFinalAgree(!!checked)
              }
            />
            <span className="text-sm">
              I confirm that the information provided is correct.
            </span>
          </div>

          <Button
            type="button"
            disabled={loading || !agree || !finalagree}
            onClick={handleSubmit}
            className="md:col-span-2 w-full bg-red-500 text-white py-5 font-bold rounded-xl"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </div>
    </div>
  )
}
