

import { supabase } from "@/db/supabase"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState,useEffect } from "react"
import { useAuth } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Trash2, Plus, Ticket } from "lucide-react"
import { Title } from "react-head"

export default function CouponManager() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const user_id = session?.user?.id

  async function fetchRestID() {
      const { data: restIDData, error } = await supabase
        .from("rest_list")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();
  
      if (error) throw error;
  
      return restIDData;
    }
  
    const { data: restIDQuery } = useQuery({
      queryKey: ["restID", user_id],
      queryFn: fetchRestID,
      enabled: !!user_id,
      staleTime: 1000 * 60 * 5,
      
    });
  
    const restID = restIDQuery?.id

  const [form, setForm] = useState({
    code: "",
    discount_value: 0,
    min_order: 0,
    expiry: "",
    max_uses: 0,
    max_uses_per_user: 0,
    discount_type: "percent",
    restID: null
  })

  useEffect(() => {
  if (restID) {
    setForm((prev) => ({
      ...prev,
      restID: restID
    }))
  }
}, [restID])

  const [saving, setSaving] = useState(false)

  const { data: couponQuery, isPending } = useQuery({
    queryKey: ["coupons", user_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").eq("user_id", user_id)
      if (error) {
        toast.error("Failed to load coupons")
      }
      return data
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from("coupons")
      .insert([{ ...form, user_id }])
      .select()
    if (error) {
      toast.error("Failed to create coupon")
    } else {
      toast.success("Coupon created successfully")
      queryClient.invalidateQueries({ queryKey: ["coupons", user_id] })
    }
    setSaving(false)
    setForm({
      code: "",
      discount_value: 0,
      min_order: 0,
      expiry: "",
      max_uses: 0,
      max_uses_per_user: 0,
    })
  }

  const deleteCoupM = async (id) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete coupon")
    } else {
      toast.success("Coupon deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["coupons", user_id] })
    }
  }

  if (isPending) {
        return (
          <div>
            <Title>Coupon Manager</Title>
            <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
              <div className="max-w-4xl mx-auto ">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                    <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                      Loading Coupon Manager...
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-5">
      <Title>Coupon Manager</Title>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-x-3 mt-7 mb-5">
        <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
          <Ticket className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
        </div>
        <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
          Coupon Manager
        </h2>
      </div>

        <div className="grid lg:grid-cols-3 gap-8 max-md:gap-4">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-6 border border-slate-200 sticky top-6"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-red-600" />
                Create Coupon
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Coupon Code</label>
                  <Input
                    name="code"
                    placeholder="e.g., SAVE20"
                    value={form.code}
                    onChange={handleChange}
                    required
                    className="uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Discount Value (%) e.g 20%</label>
                  <Input
                    name="discount_value"
                    type="number"
                    placeholder="e.g., 20"
                    value={form.discount_value}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Order (Optional) e.g: 50 USD</label>
                  <Input
                    name="min_order"
                    type="number"
                    placeholder="e.g., 500"
                    value={form.min_order}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date & Time</label>
                  <Input name="expiry" type="datetime-local" value={form.expiry} onChange={handleChange} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">How many Customers can use it e.g: 100</label>
                  <Input
                    name="max_uses"
                    type="number"
                    placeholder="e.g 100 Customers"
                    value={form.max_uses}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Uses Per Customer e.g: 1</label>
                  <Input
                    name="max_uses_per_user"
                    type="number"
                    placeholder="e.g 1 per Customer"
                    value={form.max_uses_per_user}
                    onChange={handleChange}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "Create Coupon"}
                </Button>
              </div>
            </form>
          </div>

          {/* Coupons Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Coupons</h2>

            {isPending && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <p className="text-slate-600 mt-4">Loading coupons...</p>
              </div>
            )}

            {!isPending && couponQuery?.length === 0 && (
              <div className="bg-white rounded-lg p-12 text-center border border-slate-200">
                <p className="text-slate-600 text-lg">No coupons yet. Create your first one!</p>
              </div>
            )}

            <div className="grid gap-6 max-md:place-content-center">
  {couponQuery?.map((c) => {
    const isExpired = new Date(c.expiry) < new Date()

    return (
      <div
        key={c.id}
        className=" relative bg-gradient-to-r from-red-500 to-red-600 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow w-full max-md:w-[260px]"
      >
        {/* Perforated left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 10px)",
          }}
        ></div>

        <div className="flex items-center justify-between p-6 pl-8 gap-6 max-md:flex-col max-md:text-center max-md:p-4">
          {/* Left Section */}
          <div className="flex items-center gap-8  max-md:flex-col max-md:gap-3 max-md:w-full">

            <div>
              <p className="text-white text-xs font-semibold opacity-80 mb-1">
                COUPON CODE
              </p>
              <p className="text-white text-3xl max-md:text-2xl font-black tracking-wider">
                {c.code}
              </p>
            </div>

            {/* Divider */}
            <div className="h-20 w-1 bg-white opacity-20 max-md:hidden"></div>

            <div>
              <p className="text-white text-xs font-semibold opacity-80 mb-1">
                SAVE
              </p>
              <p className="text-white text-4xl max-md:text-3xl font-black">
                {c.discount_value}%
              </p>

              {c.min_order > 0 && (
                <p className="text-white text-xs opacity-80 mt-1">
                  Min: {restIDQuery?.restCurrency} {c.min_order}
                </p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="text-right max-md:text-center max-md:w-full">
            <p className="text-white text-xs opacity-80 mb-1">EXPIRES</p>
            <p
              className={`text-sm font-semibold mb-3 ${
                isExpired ? "text-red-200" : "text-white"
              }`}
            >
              {new Date(c.expiry).toLocaleDateString()}
            </p>

            <button
              onClick={() => deleteCoupM(c.id)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded transition-all mx-auto"
              title="Delete coupon"
            >
              <Trash2 color="red" />
            </button>
          </div>
        </div>

        {/* Expired Badge */}
        {isExpired && (
          <div className="absolute top-2 right-2 bg-red-900 bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full">
            EXPIRED
          </div>
        )}
      </div>
    )
  })}
</div>

          </div>
        </div>
      </div>
    </div>
  )
}
