

import { useState, useEffect } from "react"
import { supabase } from "@/db/supabase"
import { useAuth } from "@/store/authStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
// ✅ Image Upload Component
function UploadToSupabase({ label, name, value, onChange, folder = "shops" }) {
  const { session } = useAuth()
  const [preview, setPreview] = useState(value || "")
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file || !session?.user?.id) return
    
    setUploading(true)

    try {
      const ext = file.name.split(".").pop()
      const fileName = `${session.user.id}-${Date.now()}.${ext}`
      const filePath = `${folder}/${fileName}`

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: false })

      if (error) throw error

      const { data } = supabase.storage.from("images").getPublicUrl(filePath)

      if (!data?.publicUrl) throw new Error("Could not get public URL")

      setPreview(data.publicUrl)

      // FIX — Correct naming
      onChange(name, data.publicUrl)

    } catch (err) {
      console.error("Upload failed:", err)
      alert("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="file" accept="image/*" onChange={handleUpload} />
      {uploading && <p className="text-lg text-gray-800">Uploading...</p>}
      {preview && (
        <img src={preview} className="w-32 h-32 object-cover rounded-lg mt-2" />
      )}
    </div>
  )
}


export default function MerchantReg() {
  const { session } = useAuth()
  const [status, setStatus] = useState("loading")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    business_name: "",
    full_name: "",
    phone: "",
    business_type: "",
    category: "",
    description: "",
    registration_number: "",
    tax_id: "",
    address: "",
    cnic: "",
    cnic_front_back:"",
    cnic_selfie:"",
    shopPhoto: "",
    bank_name: "",
    bank_number: "",
    swift_code: "",
    social_links: "",
    account_holder_name:"",
    google_maps_location:"",
    kitchen_photo: "",
    address_proof:"",
    product_hunt: false,
    test_info: false
    
  
  })

  // ✅ Fetch status once
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

      if (merchant?.merchant_verify === 'verified') setStatus("verified")
      else if (appData) setStatus("submitted")
      else setStatus("idle")
    }

    fetchStatus()
  }, [session?.user?.id])

  // ✅ Classic submit
  async function handleSubmit() {
  
  setLoading(true)
// only for product hunt
  //if (!form.full_name.trim() || !form.cnic.trim() || !form.phone.trim() || !form.business_type.trim() || !form.category.trim() || !form.description.trim() || !form.address.trim() || !form.google_maps_location.trim() || !form.bank_name.trim() || !form.bank_number.trim() || !form.swift_code.trim() || !form.account_holder_name.trim() || !form.kitchen_photo.trim() || !form.address_proof.trim()) {
  //    alert("Please fill all required fields before submitting.")
  //    setLoading(false)
  //    return
  //  }

  try {
    if (!session?.user?.id || !session?.user?.email) {
      throw new Error("User not authenticated")
    }

   

    const { error } = await supabase.from("merchant_apps").insert([
      {
        merchant_id: session.user.id,
        user_email: session.user.email,
        full_name: form.full_name,
        phone: form.phone,
        business_name: form.business_name,
        business_type: form.business_type,
        registration_number: form.registration_number,
        tax_id: form.tax_id,
        address: form.address,
        google_maps_location: form.google_maps_location,
        category: form.category,
        description: form.description,
        bank_name: form.bank_name,
        bank_number: form.bank_number,
        swift_code: form.swift_code,
        account_holder_name: form.account_holder_name,
        social_links: form.social_links,
        cnic: form.cnic,
        cnic_front_back:form.cnic_front_back,
        cnic_selfie: form.cnic_selfie,
        shopPhoto: form.shopPhoto,
        kitchen_photo: form.kitchen_photo,
        address_proof: form.address_proof,
        product_hunt: form.product_hunt,
        test_info: form.test_info
      },
    ])

    if (error) throw error

    alert("✅ Application submitted successfully")
    setStatus("submitted")
  } catch (err) {
    console.error("❌ Insert failed:", err)
    alert(err.message)
  } finally {
    setLoading(false)
  }
}

const checklistItems = [
    'Kitchen is cleaned daily',
    'All surfaces and utensils are washed with soap',
    'Raw and cooked foods are stored separately',
    'Separate cutting boards for meat and vegetables',
    'Food containers are sealed and clean',
    'No insects or pests in the kitchen',
    'Hands are washed frequently during preparation',
    'Gloves used while preparing food when required',
    'Hair is covered (cap or scarf) while cooking',
    'No sick person handles food',
    'Ingredients are fresh and not expired',
    'Perishables are refrigerated when needed',
    'Food is cooked to safe temperatures',
    'Packaging is food-grade and sealed'
  ]

    const [agree, setAgree] = useState(false)
    const [finalagree, setFinalAgree] = useState(false)



  // ✅ UI STATES
  if (status === "loading") {
    return <div className="flex items-center justify-center text-4xl text-center min-h-screen text-gray-900">Loading Form...</div>
  }

  if (status === "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-green-600">Verified ✅</h2>
          <p>Your account has been approved.</p>
        </div>
      </div>
    )
  }

  if (status === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-yellow-600">Under Review ⏳</h2>
          <p>Your application is being reviewed.</p>
        </div>
      </div>
    )
  }

  // ✅ FORM
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Merchant Registration</h1>
        <div className="flex items-center gap-x-2 mb-3">
          <Info size={20} />
          <h2 className="mb-3 flex items-center gap-2">
            Just exploring? Product Hunt/ShipIt users may use test data and skip photo
            uploads. 
            <br/>
            Setting up a real restaurant? Please enter real details and
            upload images.
          </h2>
        </div>

        <form className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="space-y-2 md:col-span-2 mb-4">
              <Label>Are you a Product Hunt/ShipIt Member?</Label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="product_hunt"
                    checked={form.product_hunt === true}
                    onChange={() => setForm({ ...form, product_hunt: true })}
                  />
                  <span>Yes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="product_hunt"
                    checked={form.product_hunt === false}
                    onChange={() => setForm({ ...form, product_hunt: false })}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 mb-4">
              <Label>The Information you will provide is test info?</Label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="test_info"
                    checked={form.test_info === true}
                    onChange={() => setForm({ ...form, test_info: true })}
                  />
                  <span>Yes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="test_info"
                    checked={form.test_info === false}
                    onChange={() => setForm({ ...form, test_info: false })}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <Label>Business Name</Label>
            <Input
              placeholder="Enter Name"
              required
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Owner Name</Label>
            <Input
              placeholder="Full Name"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Owner Phone - Registered on CNIC Preferred</Label>
            <Input
              placeholder="03XXXXXXXXX"
              required
              type="number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Business Type</Label>
            <select
              required
              value={form.business_type}
              onChange={(e) =>
                setForm({ ...form, business_type: e.target.value })
              }
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Business Type</option>

              <option value="Physical Restaurant">Physical Restaurant</option>
              <option value="Home Chef">Home Chef</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Business Category</Label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Category</option>

              {/* Food Categories */}
              <option value="Fast Food">Fast Food</option>
              <option value="Bakery">Bakery</option>
              <option value="Cafe">Cafe</option>
              <option value="Fine Dining">Fine Dining</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe your Business"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="md:col-span-2"
            />
          </div>
          <div className="space-y-1">
            <Label>Registration No - Leave Blank for Home Chef</Label>
            <Input
              placeholder="Registration #"
              value={form.registration_number}
              onChange={(e) =>
                setForm({ ...form, registration_number: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Tax ID - Leave Blank for Home Chef</Label>
            <Input
              placeholder="NTN"
              value={form.tax_id}
              onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Owner CNIC No.</Label>
            <Input
              placeholder="42101-XXXX-XXX-X"
              required
              value={form.cnic}
              onChange={(e) => setForm({ ...form, cnic: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex gap-x-2">
              <Label>Valid CNIC - Front + Back </Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={17} />
                </TooltipTrigger>
                <TooltipContent>
                  <img src="/cnic.jpg" className="w-[160px]" alt="cnic" />
                </TooltipContent>
              </Tooltip>
            </div>
            <UploadToSupabase
              name="cnic_front_back" // FIXED
              folder="cnic" // Store in cnic/ folder
              value={form.cnic_front_back}
              onChange={(k, v) => setForm({ ...form, [k]: v })}
            />
          </div>

          <div>
            <div className="flex gap-x-2">
              <Label>Selfie with CNIC</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={17} />
                </TooltipTrigger>
                <TooltipContent>
                  <img src="/selfie.jpeg" className="w-[250px]" alt="cnic" />
                </TooltipContent>
              </Tooltip>
            </div>
            <UploadToSupabase
              name="cnic_selfie" // FIXED
              folder="cnic_selfie" // Store in cnic/ folder
              value={form.cnic_selfie}
              onChange={(k, v) => setForm({ ...form, [k]: v })}
            />
          </div>
          <div className="space-y-1">
            <Label>Business Address</Label>
            <Textarea
              placeholder="Enter Business Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="md:col-span-2"
            />
          </div>

          <div>
            <UploadToSupabase
              label="Address Proof - Utility Bill or Rent Agreement"
              name="address_proof" // FIXED
              folder="address_proof" // Store in cnic/ folder
              value={form.address_proof}
              onChange={(k, v) => setForm({ ...form, [k]: v })}
            />
          </div>

          <div className="space-y-1">
            <Label>Google Maps Location Pin</Label>
            <Input
              placeholder="https://maps.app.goo.gl/XXXXXXXXXXXXXXXX"
              required
              value={form.google_maps_location}
              onChange={(e) =>
                setForm({ ...form, google_maps_location: e.target.value })
              }
              className="md:col-span-2"
            />
          </div>

          <div>
            <UploadToSupabase
              label="Kitchen Photo"
              name="kitchen_photo" // FIXED
              folder="kitchen_photo" // Store in cnic/ folder
              value={form.kitchen_photo}
              onChange={(k, v) => setForm({ ...form, [k]: v })}
            />
          </div>

          <div className="space-y-1">
            <Label>Bank Name</Label>
            <Input
              placeholder="e.g: Meezan Bank"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Account Holder Name</Label>
            <Input
              placeholder="e.g: Javed Sohail"
              value={form.account_holder_name}
              onChange={(e) =>
                setForm({ ...form, account_holder_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>IBAN/Account Number</Label>
            <Input
              placeholder="Enter number"
              value={form.bank_number}
              onChange={(e) =>
                setForm({ ...form, bank_number: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Swift Code</Label>
            <Input
              placeholder="MEZNPXX"
              value={form.swift_code}
              onChange={(e) => setForm({ ...form, swift_code: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Your Business Social Media Link FB, Insta etc</Label>
            <Textarea
              placeholder="Social Links e.g https://facebook/profilename"
              value={form.social_links}
              onChange={(e) =>
                setForm({ ...form, social_links: e.target.value })
              }
              className="md:col-span-2"
            />
          </div>

          <div className="mb-4 border rounded-lg p-4">
            <div className="flex justify-center items-center">
              <h2 className="text-2xl font-semibold mb-3">
                Food Safety Declaration
              </h2>
            </div>

            <div className="grid gap-3 text-sm">
              {checklistItems.map((item) => (
                <div key={item}>• {item}</div>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                checked={agree}
                onCheckedChange={(checked) => setAgree(checked)}
                color="red"
              />
              <span className="text-sm">
                I hereby declare that I follow the stated hygiene practices.
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Restaurant Photo - Not required for Home Chef</Label>
            <UploadToSupabase
              name="shopPhoto"
              value={form.shopPhoto}
              onChange={(k, v) => setForm({ ...form, [k]: v })}
            />
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              checked={finalagree}
              onCheckedChange={(checked) => setFinalAgree(checked)}
              color="red"
            />
            <span className="text-sm">
              I hereby declare that all entered information is correct and up to
              date
            </span>
          </div>

          <Button
            type="button" // ✅ NOT submit anymore
            disabled={loading || !agree || !finalagree}
            onClick={handleSubmit} // ✅ Manual submit
            className="md:col-span-2 w-full bg-red-500 text-white py-5 font-bold rounded-xl"
          >
            {loading ? "Submitting..." : `Submit for Verification`}
          </Button>
        </form>
      </div>
    </div>
  );
}
