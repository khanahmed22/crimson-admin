import { supabase } from "@/db/supabase";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  X,
  Edit3,
  Upload,
  ImageIcon,
  Palette,
  SettingsIcon,
  Clock,
  Pencil,
  PencilLine,
  PartyPopper,
  GlobeLock,
  Store,
  Bell,
  Drum,
  Instagram,
  Facebook,
  Phone,
  Mail,
  MapPin,
  Search,
  Copy,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/store/authStore";
import { Title } from "react-head";
import { useMutation } from "@tanstack/react-query";
import { enableNotifications } from "@/notifications/firebase";
import { useNavigate } from "react-router";
import Domain from "@/components/Domain";
import { Label } from "@/components/ui/label";
import MerchantPickupLocation from "@/components/MerchantPickupLocation";
import { useEffect } from "react";
export default function Settings() {
  const { session, saveTheme } = useAuth();
  const user_id = session?.user?.id;

  const queryClient = useQueryClient();

  // for rest logo update
  const [newLogoFile, setNewLogoFile] = useState(null);

  // for hero image update
  const [newHeroFile, setNewHeroFile] = useState(null);

  // for rest theme update
  const [newTheme, setNewTheme] = useState(null);

  const [showLogoEdit, setShowLogoEdit] = useState(false);
  const [showThemeEdit, setShowThemeEdit] = useState(false);
  const [showHeroEdit, setShowHeroEdit] = useState(false);

  const [openTime, setOpenTime] = useState(0);
  const [closeTime, setCloseTime] = useState(0);
  const [editTime, setEditTime] = useState(false);
  const [timeID, setTimeID] = useState(0);
  const [announcementEdit, setAnnouncementEdit] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [editContact, setEditContact] = useState(false);
  const [restPhone, setRestPhone] = useState("");
  const [restEmail, setRestEmail] = useState("");
  const [restAddress, setRestAddress] = useState("");
  const [restIntro, setRestIntro] = useState("");
  const [restInstagram, setRestInstagram] = useState("");
  const [restFB, setRestFB] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [editSEO, setEditSEO] = useState(false);
  const [restCurrency, setRestCurrency] = useState("");

  const navigate = useNavigate();

  const [preorderEnabled, setPreorderEnabled] = useState(true);
  const [preorderMinHours, setPreorderMinHours] = useState(2);
  const [preorderMaxDays, setPreorderMaxDays] = useState(7);

  const [deliveryWindows, setDeliveryWindows] = useState([]);
  const [pickupWindows, setPickupWindows] = useState([]);

  const [newWindow, setNewWindow] = useState("");

  const [newPickupWindow, setNewPickupWindow] = useState("");


  // ✅ Upload image helper
  const uploadImage = async (file, folder = "foods") => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${user_id}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${user_id}/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ✅ Fetch restaurant details
  const fetchRestDetails = async () => {
    const { data, error } = await supabase
      .from("rest_list")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  const { data: restQuery, isPending } = useQuery({
    queryKey: ["restData", user_id],
    queryFn: fetchRestDetails,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
  });

  const restID = restQuery?.id;

  // ✅ Update restaurant logo
  const updateRestLogo = async () => {
    if (!newLogoFile) return;
    try {
      const restLogo = await uploadImage(newLogoFile, "logos");

      const { error } = await supabase
        .from("rest_list")
        .update({ restLogo })
        .eq("user_id", user_id);

      if (error) throw error;

      toast.success("Restaurant logo updated!");
      queryClient.invalidateQueries(["restData", user_id]);
      setNewLogoFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Error updating logo");
    }
  };

  // ✅ Update restaurant hero image
  const updateRestHero = async () => {
    if (!newHeroFile) return;
    try {
      const hero_img = await uploadImage(newHeroFile, "hero");

      const { error } = await supabase
        .from("rest_list")
        .update({ hero_img })
        .eq("user_id", user_id);

      if (error) throw error;

      toast.success("Hero image updated!");
      queryClient.invalidateQueries(["restData", user_id]);
      setNewHeroFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Error updating hero image");
    }
  };

  // ✅ Update restaurant theme
  const updateRestTheme = async () => {
    if (!newTheme) return;
    try {
      const { error } = await supabase
        .from("rest_list")
        .update({ restTheme: newTheme })
        .eq("user_id", user_id);

      if (error) throw error;

      toast.success("Theme updated!");

      queryClient.invalidateQueries(["restData", user_id]);

      setNewTheme(null);
    } catch (err) {
      console.error(err);
      toast.error("Error updating theme");
    }
  };

  //fetch restaurant timings

  const fetchRestTimings = async () => {
    const { data, error } = await supabase
      .from("timings")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Sort data according to the day order
    const sortedData = data.sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
    );

    return sortedData;
  };

  const { data: timeQuery } = useQuery({
    queryKey: ["timeData", user_id],
    queryFn: fetchRestTimings,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
  });

  //update time

  const updateTime = async ({ openTime, closeTime, timeID }) => {
    try {
      const { data, error } = await supabase
        .from("timings")
        .update({ openTime: openTime, closeTime: closeTime })
        .eq("timeID", timeID)
        .eq("user_id", user_id);

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Time update error:", err);
      throw err;
    }
  };

  const { mutate: updateTimeM } = useMutation({
    mutationKey: ["updateTimeM"],
    mutationFn: updateTime,
    onSuccess: () => {
      toast.success("Time Updated");
      queryClient.invalidateQueries(["timeData", user_id]);
    },
    onError: () => {
      toast.error("Failed to update time");
    },
  });

  function formatTime12h(timeString) {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // convert 0 → 12, 13 → 1
    return `${h}:${minute} ${ampm}`;
  }

  // update announcement

  const updateAnnouncement = async (newText) => {
    const { error } = await supabase
      .from("rest_list")
      .update({ announcement: newText })
      .eq("user_id", user_id);

    if (error) throw error;
  };

  const { mutate: updateAnnouncementM } = useMutation({
    mutationKey: ["announcementUpdate"],
    mutationFn: updateAnnouncement,
    onSuccess: () => {
      toast.success("Announcement Updated");
      queryClient.invalidateQueries(["restData", user_id]);
    },
  });

  const updateContactInfo = async (payload) => {
    if (!user_id) throw new Error("No user_id");

    const { data, error } = await supabase
      .from("rest_list")
      .update(payload)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      console.error("Contact update error:", error);
      throw error;
    }

    return data;
  };

  const { mutate: updateContactInfoM } = useMutation({
    mutationFn: updateContactInfo,
    onSuccess: () => {
      toast.success("Updated!");
      queryClient.invalidateQueries(["restData", user_id]);
      setEditContact(false);
    },
    onError: () => {
      toast.error("Failed to update contact info");
    },
  });

  // 🔔 Check notification status
  const fetchNotificationStatus = async () => {
    // Browser permission is the FIRST gate
    if (Notification.permission !== "granted") {
      return false;
    }

    const { data: rest } = await supabase
      .from("rest_list")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!rest) return false;

    const { data } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("restID", rest.id)
      .limit(1)
      .maybeSingle();

    return !!data;
  };

  const { data: notificationsEnabled, isLoading: notifLoading } = useQuery({
    queryKey: ["notification-status", user_id],
    queryFn: fetchNotificationStatus,
    enabled: !!user_id,
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
  });

  const { data: merchantStatus } = useQuery({
    queryKey: ["merchantStatus", user_id],
    queryFn: async () => {
      if (!user_id) return null;

      const { data, error } = await supabase
        .from("merchant_accounts")
        .select("plan,merchant_verify")
        .eq("merchant_id", user_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user_id,
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
  });

  // remove branding
  const updateRemoveBranding = async (value) => {
    const { error } = await supabase
      .from("rest_list")
      .update({ removeBranding: value })
      .eq("user_id", user_id);

    if (error) throw error;
  };

  const { mutate: updateRemoveBrandingM, isPending: brandingLoading } =
    useMutation({
      mutationKey: ["removeBranding"],
      mutationFn: updateRemoveBranding,
      onSuccess: () => {
        toast.success("Branding updated");
        queryClient.invalidateQueries(["restData", user_id]);
      },
      onError: () => {
        toast.error("Failed to update branding");
      },
    });

  const updateSEO = async ({ metaTitle, metaDesc }) => {
    if (!user_id) throw new Error("No user_id");

    const payload = {};

    if (metaTitle?.trim() && metaTitle.trim() !== restQuery?.metaTitle) {
      payload.metaTitle = metaTitle.trim();
    }

    if (metaDesc?.trim() && metaDesc.trim() !== restQuery?.metaDesc) {
      payload.metaDesc = metaDesc.trim();
    }

    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing changed");
    }

    const { error } = await supabase
      .from("rest_list")
      .update(payload)
      .eq("user_id", user_id);

    if (error) throw error;
  };

  const { mutate: updateSEOM } = useMutation({
    mutationFn: updateSEO,
    onSuccess: () => {
      toast.success("SEO info updated");
      queryClient.invalidateQueries(["restData", user_id]);
    },
    onError: () => {
      toast.error("Failed to update SEO info");
    },
  });

  const CURRENCIES = [
    { code: "USD", label: "USD – US Dollar" },
    { code: "PKR", label: "PKR – Pakistani Rupee" },
    { code: "EUR", label: "EUR – Euro" },
    { code: "GBP", label: "GBP – British Pound" },
    { code: "AED", label: "AED – UAE Dirham" },
    { code: "SAR", label: "SAR – Saudi Riyal" },
  ];

  const updateCurrency = async (currency) => {
    if (!user_id) throw new Error("No user_id");

    const { error } = await supabase
      .from("rest_list")
      .update({ restCurrency: currency })
      .eq("user_id", user_id);

    if (error) throw error;
  };

  const { mutate: updateCurrencyM, isPending: currencyLoading } = useMutation({
    mutationFn: updateCurrency,
    onSuccess: () => {
      toast.success("Currency updated");
      queryClient.invalidateQueries(["restData", user_id]);
    },
    onError: () => {
      toast.error("Failed to update currency");
    },
  });

  // ✅ Update pickup/delivery toggles
  const updateFulfillment = async (payload) => {
    if (!user_id) throw new Error("No user_id");

    const { error } = await supabase
      .from("rest_list")
      .update(payload)
      .eq("user_id", user_id);

    if (error) throw error;
  };

  const { mutate: updateFulfillmentM, isPending: fulfillmentLoading } =
    useMutation({
      mutationKey: ["updateFulfillment"],
      mutationFn: updateFulfillment,
      onSuccess: () => {
        toast.success("Updated");
        queryClient.invalidateQueries(["restData", user_id]);
      },
      onError: () => {
        toast.error("Failed to update");
      },
    });

  useEffect(() => {
    if (!restQuery) return;

    setPreorderEnabled(restQuery.preorder_enabled ?? true);
    setPreorderMinHours(restQuery.preorder_min_hours ?? 2);
    setPreorderMaxDays(restQuery.preorder_max_days ?? 7);

    setDeliveryWindows(restQuery.delivery_windows ?? []);
    setPickupWindows(restQuery.pickup_windows ?? []);
  }, [restQuery]);

  

  const updatePreorderSettings = async (payload) => {
    if (!user_id) throw new Error("No user_id");

    const { error } = await supabase
      .from("rest_list")
      .update(payload)
      .eq("user_id", user_id);

    if (error) throw error;
  };

  const { mutate: updatePreorderSettingsM, isPending: preorderLoading } =
    useMutation({
      mutationFn: updatePreorderSettings,
      onSuccess: () => {
        toast.success("Preorder settings updated");
        queryClient.invalidateQueries(["restData", user_id]);
      },
      onError: () => {
        toast.error("Failed to update preorder settings");
      },
    });

  if (isPending) {
    return (
      <div>
        <Title>Settings</Title>
        <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
          <div className="max-w-4xl mx-auto ">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                  Loading Settings...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title>Settings</Title>
      <div className="max-md:mt-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <div className="flex  items-center justify-center gap-x-3">
            <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
              <SettingsIcon className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
            </div>
            <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Store Settings
            </h2>
          </div>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Logo Management Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg max-md:text-sm font-semibold text-text">
                  Restaurant Logo
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoEdit(!showLogoEdit)}
                className="border-accent/20 text-accent hover:bg-accent/10 p-2 rounded-lg"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>

            {restQuery?.restLogo && (
              <div className="mb-4">
                <img
                  className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                  src={restQuery?.restLogo || "/cc.jpg"}
                  alt="Restaurant Logo"
                />
              </div>
            )}

            {showLogoEdit && (
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewLogoFile(e.target.files[0])}
                  className="border-gray-200 focus:border-accent rounded-xl"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      updateRestLogo();
                      setShowLogoEdit(false);
                    }}
                    disabled={!newLogoFile}
                    className="flex-1 btn-accent font-medium py-2.5 rounded-xl transition-all duration-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Update Logo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLogoEdit(false);
                      setNewLogoFile(null);
                    }}
                    className="px-4 py-2.5 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Announcement */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <PartyPopper className="w-5 h-5 text-accent" />
                </div>
                <div className="flex flex-col items-start">
                  <h3 className="text-lg max-md:text-sm font-semibold text-text">
                    Announcement
                  </h3>
                  <h4 className="text-sm text-slate-700">
                    Will show at the top of store
                  </h4>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAnnouncementEdit(!announcementEdit);
                  setAnnouncementText(restQuery?.announcement || "");
                }}
              >
                {announcementEdit ? "Cancel" : <PencilLine />}
              </Button>
            </div>

            {!announcementEdit && (
              <p className="text-gray-700 font-bold mt-2 border p-2 rounded-xl max-md:text-sm">
                {restQuery?.announcement || "Nothing to announce yet"}
              </p>
            )}

            {announcementEdit && (
              <div className="space-y-3">
                <Input
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Write announcement..."
                />

                <Button
                  className="btn-accent"
                  onClick={() => {
                    updateAnnouncementM(announcementText);
                    setAnnouncementEdit(false);
                  }}
                >
                  Save Announcement
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-start gap-3 max-md:flex-col ">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg max-md:text-sm font-semibold text-text">
                      Push Notifications
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Get notified when orders or events happen
                </p>
              </div>

              {!notifLoading && notificationsEnabled ? (
                <Button
                  variant="outline"
                  disabled
                  className="text-green-600 border-green-300"
                >
                  ✓ Enabled
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    await enableNotifications(user_id);
                    queryClient.invalidateQueries([
                      "notification-status",
                      user_id,
                    ]);
                  }}
                  className="btn-accent"
                >
                  Enable Notifications
                </Button>
              )}
            </div>
          </div>

          {/* Theme Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Palette className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg max-md:text-sm font-semibold text-text">
                  Theme Settings
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowThemeEdit(!showThemeEdit)}
                className="border-accent/20 text-accent hover:bg-accent/10 p-2 rounded-lg"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>

            {!showThemeEdit && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Current Theme:</p>
                <p className="font-semibold text-text capitalize">
                  {restQuery?.restTheme || "Default"}
                </p>
              </div>
            )}

            {showThemeEdit && (
              <div className="space-y-3">
                <Select
                  onValueChange={(val) => setNewTheme(val)}
                  defaultValue={restQuery?.restTheme}
                >
                  <SelectTrigger className="w-full border-gray-200 focus:border-accent rounded-xl">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="pink">🌸 Pink</SelectItem>
                    <SelectItem value="blue">🌊 Blue</SelectItem>
                    <SelectItem value="green">🌿 Green</SelectItem>
                    <SelectItem value="purple">🔮 Purple</SelectItem>
                    <SelectItem value="orange">🍊 Orange</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      updateRestTheme();
                      setShowThemeEdit(false);
                      saveTheme(newTheme);
                    }}
                    disabled={!newTheme}
                    className="flex-1 btn-accent font-medium py-2.5 rounded-xl transition-all duration-200"
                  >
                    Update Theme
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowThemeEdit(false);
                      setNewTheme(null);
                    }}
                    className="px-4 py-2.5 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hero Banner Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg max-md:text-sm font-semibold text-text">
                Hero Banner
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHeroEdit(!showHeroEdit)}
              className="border-accent/20 text-accent hover:bg-accent/10 p-2 rounded-lg"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>

          {restQuery?.hero_img && (
            <div className="mb-4">
              <img
                className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                src={restQuery?.hero_img || "/cc.jpg"}
                alt="Hero Banner"
              />
            </div>
          )}

          {showHeroEdit && (
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setNewHeroFile(e.target.files[0])}
                className="border-gray-200 focus:border-accent rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateRestHero();
                    setShowHeroEdit(false);
                  }}
                  disabled={!newHeroFile}
                  className="flex-1 btn-accent font-medium py-2.5 rounded-xl transition-all duration-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Update Hero
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowHeroEdit(false);
                    setNewHeroFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*Contact Info*/}

      {/* Contact Information */}
      <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Store className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg max-md:text-sm font-semibold text-text">
              Store Public Info
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditContact(!editContact);
              setRestPhone(restQuery?.restPhone || "");
              setRestEmail(restQuery?.restEmail || "");
              setRestAddress(restQuery?.restAddress || "");
              setRestIntro(restQuery?.restIntro || "");
              setRestInstagram(restQuery?.restInstagram || "");
              setRestFB(restQuery?.restFB || "");
              setMetaTitle(restQuery?.metaTitle || "");
              setMetaDesc(restQuery?.metaDesc || "");
              setRestCurrency(restQuery?.restCurrency || "");
            }}
          >
            {editContact ? "Cancel" : <Edit3 />}
          </Button>
        </div>

        {!editContact && (
          <div className="space-y-3 text-gray-700">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent" />
              <span className="font-semibold">Phone:</span>
              <span>{restQuery?.restPhone || "Not added"}</span>
            </p>

            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              <span className="font-semibold">Email:</span>
              <span>{restQuery?.restEmail || "Not added"}</span>
            </p>

            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-semibold">Address:</span>
              <span>{restQuery?.restAddress || "Not added"}</span>
            </p>

            <p className="flex items-center gap-2">
              <Drum className="w-4 h-4 text-accent" />
              <span className="font-semibold">Intro:</span>
              <span>{restQuery?.restIntro || "No intro added"}</span>
            </p>
          </div>
        )}

        {editContact && (
          <div className="space-y-3 mt-3 mb-10">
            <Label>Restaurant Phone Number</Label>
            <Input
              placeholder="Phone Number"
              value={restPhone}
              onChange={(e) => setRestPhone(e.target.value)}
            />
            <Label>Restaurant Email</Label>
            <Input
              placeholder="Email"
              value={restEmail}
              onChange={(e) => setRestEmail(e.target.value)}
            />
            <Label>Restaurant Address</Label>
            <Input
              placeholder="Address"
              value={restAddress}
              onChange={(e) => setRestAddress(e.target.value)}
            />
            <Label>Restaurant Intro</Label>
            <Input
              placeholder="Restaurant Intro"
              value={restIntro}
              onChange={(e) => setRestIntro(e.target.value)}
            />
            <Label>Restaurant Instagram Profile Link</Label>
            <Input
              placeholder="Instagram Profile Link"
              value={restInstagram}
              onChange={(e) => setRestInstagram(e.target.value)}
            />

            <Label>Restaurant Facebook Page Link</Label>

            <Input
              placeholder="Facebook Page Link"
              value={restFB}
              onChange={(e) => setRestFB(e.target.value)}
            />

            <Button
              className="btn-accent"
              onClick={() => {
                updateContactInfoM({
                  restPhone,
                  restEmail,
                  restAddress,
                  restIntro,
                  restInstagram,
                  restFB,
                });
                setEditContact(false);
              }}
            >
              Save
            </Button>
          </div>
        )}

        <div>
          <MerchantPickupLocation restID={restID} />
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Store Socials
          </p>

          <div className="flex flex-col space-y-3">
            <p className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              <span className="font-semibold">Instagram:</span>
              <span className="truncate">
                {restQuery?.restInstagram || "No Instagram profile added"}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Facebook:</span>
              <span className="truncate">
                {restQuery?.restFB || "No Facebook profile added"}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/*Restaurant Timings*/}

      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300 mb-8 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg max-md:text-sm font-semibold text-text">
            Restaurant Timings - (Open - Close)
          </h3>
        </div>

        <div>
          {!isPending && timeQuery?.length > 0 ? (
            timeQuery.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-around py-2 border-1 rounded-lg mb-2 shadow-lg border-slate-300"
              >
                <span className="w-20 font-semibold">{t.day}</span>

                {editTime && timeID === t.timeID ? (
                  <div className="flex gap-2 max-md:flex-col">
                    <Input
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      type="time"
                    />
                    <Input
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      type="time"
                    />
                    <Button
                      className="bg-blue-500 text-white"
                      onClick={() => {
                        updateTimeM({ timeID, openTime, closeTime });
                        setEditTime(false);
                      }}
                    >
                      Save
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditTime(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-6 items-center">
                    <span>{formatTime12h(t.openTime)}</span>
                    <span>{formatTime12h(t.closeTime)}</span>
                    <Button
                      onClick={() => {
                        setEditTime(true);
                        setTimeID(t.timeID);
                        setOpenTime(t.openTime);
                        setCloseTime(t.closeTime);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div>No timings found</div>
          )}
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6 mt-6 mb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <GlobeLock className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg max-sm:text-sm font-semibold text-gray-900">
            Domain Management
          </h3>
        </div>

        {/* Current Domain */}
        <div className="rounded-xl border bg-gray-50 p-4 space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Domain Info */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Current Domain
            </p>
            <p className="text-sm font-medium text-gray-900">
              {restQuery?.restSite || "Not connected"}
            </p>
          </div>

          {/* Copy Button */}
          {restQuery?.restSite && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(restQuery.restSite);
                toast.info("URL copied to clipboard!"); // Or use toast notification
              }}
              className="mt-2 sm:mt-0 inline-flex items-center gap-2 px-3 py-1.5  rounded-md text-sm font-medium text-gray-700 transition"
            >
              <Copy />
            </button>
          )}
        </div>

        {/* Change Domain */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-gray-900">
            Change Domain
          </h4>

          {merchantStatus?.plan === "pro" ? (
            <Domain />
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span
                className="font-semibold cursor-pointer underline"
                onClick={() => navigate("/account")}
              >
                Upgrade to Pro
              </span>{" "}
              to connect your own custom domain.
            </div>
          )}
        </div>
      </section>
      {/*Remove Branding*/}
      <section className="mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex max-md:flex-col items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 flex items-center gap-x-4">
              <Drum className="w-5 h-5 text-accent" />{" "}
              <span className="max-md:text-sm">
                {" "}
                Remove "Powered By Crimson Castle"
              </span>
            </p>
            <p className="text-sm max-md:text-xs max-md:mb-4 text-gray-600 mt-4">
              Hide platform branding from your store
            </p>
          </div>

          {merchantStatus?.plan === "pro" ? (
            <Button
              className="btn-accent"
              disabled={brandingLoading}
              onClick={() => updateRemoveBrandingM(!restQuery?.removeBranding)}
            >
              {brandingLoading
                ? "Updating..."
                : restQuery?.removeBranding
                  ? "Enable Branding"
                  : "Remove Branding"}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/account")}>
              Upgrade to Pro
            </Button>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300 mb-8 mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Search className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg max-sm:text-sm font-semibold text-gray-900">
              SEO – Search Engine Optimization
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditSEO(!editSEO);
              setMetaTitle(restQuery?.metaTitle || "");
              setMetaDesc(restQuery?.metaDesc || "");
            }}
          >
            {editSEO ? "Cancel" : <Edit3 />}
          </Button>
        </div>

        {/* View Mode */}
        {!editSEO && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Meta Title
              </p>
              <p className="font-medium truncate">
                {restQuery?.metaTitle || "Not set"}
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Meta Description
              </p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {restQuery?.metaDesc || "Not set"}
              </p>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {editSEO && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                placeholder="Meta Title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Input
                placeholder="Meta Description"
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
              />
            </div>

            <Button
              className="btn-accent"
              onClick={() => updateSEOM({ metaTitle, metaDesc })}
              disabled={
                metaTitle.trim() === restQuery?.metaTitle &&
                metaDesc.trim() === restQuery?.metaDesc
              }
            >
              Save SEO Settings
            </Button>
          </div>
        )}
      </section>

      {/*Currency*/}

      <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300 mb-8 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Banknote className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg max-sm:text-sm font-semibold text-gray-900">
              Set Store Currency
            </h3>
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
          <Label>Currency</Label>

          <Select
            defaultValue={restQuery?.restCurrency || ""}
            onValueChange={(val) => updateCurrencyM(val)}
            disabled={currencyLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-gray-500">
            Prices across your store will use this currency.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300 mb-8 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Store className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg max-sm:text-sm font-semibold text-gray-900">
            Fulfillment Options
          </h3>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Pickup */}
          <div className="flex items-center justify-between rounded-xl border p-4 bg-gray-50">
            <div>
              <p className="font-semibold text-gray-900">Pickup</p>
              <p className="text-xs text-gray-600">
                Customers can place pickup orders
              </p>
            </div>

            <Button
              disabled={fulfillmentLoading}
              variant={restQuery?.restPickup ? "default" : "outline"}
              className={restQuery?.restPickup ? "btn-accent" : ""}
              onClick={() =>
                updateFulfillmentM({ restPickup: !restQuery?.restPickup })
              }
            >
              {restQuery?.restPickup ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Delivery */}
          <div className="flex items-center justify-between rounded-xl border p-4 bg-gray-50">
            <div>
              <p className="font-semibold text-gray-900">Delivery</p>
              <p className="text-xs text-gray-600">
                Customers can place delivery orders
              </p>
            </div>

            <Button
              disabled={fulfillmentLoading}
              variant={restQuery?.restDelivery ? "default" : "outline"}
              className={restQuery?.restDelivery ? "btn-accent" : ""}
              onClick={() =>
                updateFulfillmentM({ restDelivery: !restQuery?.restDelivery })
              }
            >
              {restQuery?.restDelivery ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Safety check */}
          {!restQuery?.restPickup && !restQuery?.restDelivery && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              ⚠️ Both pickup and delivery are disabled. Customers will not be be
              able to order.
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300 mb-8 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg max-sm:text-sm font-semibold text-gray-900">
            Preorder Settings
          </h3>
        </div>

        <div className="space-y-4 max-w-xl">
          {/* Enable preorder */}
          <div className="flex items-center justify-between rounded-xl border p-4 bg-gray-50">
            <div>
              <p className="font-semibold text-gray-900">Enable Preorders</p>
              <p className="text-xs text-gray-600">
                Customers can schedule orders for a later time
              </p>
            </div>

            <Button
              disabled={preorderLoading}
              variant={preorderEnabled ? "default" : "outline"}
              className={preorderEnabled ? "btn-accent" : ""}
              onClick={() => {
                const newVal = !preorderEnabled;
                setPreorderEnabled(newVal);
                updatePreorderSettingsM({ preorder_enabled: newVal });
              }}
            >
              {preorderEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {/* Max days */}
          <div className="rounded-xl border p-4 bg-gray-50 space-y-2">
            <Label>Max days in advance</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={preorderMaxDays}
              onChange={(e) => setPreorderMaxDays(Number(e.target.value))}
            />

            <Button
              disabled={preorderLoading}
              className="btn-accent"
              onClick={() =>
                updatePreorderSettingsM({ preorder_max_days: preorderMaxDays })
              }
            >
              Save
            </Button>
          </div>

          

          {/* Delivery windows */}
          <div className="rounded-xl border p-4 bg-gray-50 space-y-3">
            <Label>Delivery time windows</Label>

            <div className="flex gap-2">
              <Input
                value={newWindow}
                onChange={(e) => setNewWindow(e.target.value)}
                placeholder="e.g. 7pm - 9pm"
              />
              <Button
                type="button"
                className="btn-accent"
                onClick={() => {
                  const w = newWindow.trim();
                  if (!w) return;

                  const updated = [...deliveryWindows, w];
                  setDeliveryWindows(updated);
                  setNewWindow("");

                  updatePreorderSettingsM({ delivery_windows: updated });
                }}
              >
                Add
              </Button>
            </div>

            {deliveryWindows?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {deliveryWindows.map((w, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-sm"
                  >
                    <span>{w}</span>
                    <X
                      className="w-4 h-4 cursor-pointer text-red-500"
                      onClick={() => {
                        const updated = deliveryWindows.filter(
                          (_, i) => i !== idx,
                        );
                        setDeliveryWindows(updated);
                        updatePreorderSettingsM({ delivery_windows: updated });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600">No windows added yet</p>
            )}
          </div>

          {/* Pickup windows */}
<div className="rounded-xl border p-4 bg-gray-50 space-y-3">
  <Label>Pickup time windows</Label>

  <div className="flex gap-2">
    <Input
      value={newPickupWindow}
      onChange={(e) => setNewPickupWindow(e.target.value)}
      placeholder="e.g. 6pm - 8pm"
    />
    <Button
      type="button"
      className="btn-accent"
      onClick={() => {
        const w = newPickupWindow.trim();
        if (!w) return;

        const updated = [...pickupWindows, w];
        setPickupWindows(updated);
        setNewPickupWindow("");

        updatePreorderSettingsM({ pickup_windows: updated });
      }}
    >
      Add
    </Button>
  </div>

  {pickupWindows?.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {pickupWindows.map((w, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-sm"
        >
          <span>{w}</span>
          <X
            className="w-4 h-4 cursor-pointer text-red-500"
            onClick={() => {
              const updated = pickupWindows.filter((_, i) => i !== idx);
              setPickupWindows(updated);
              updatePreorderSettingsM({ pickup_windows: updated });
            }}
          />
        </div>
      ))}
    </div>
  ) : (
    <p className="text-xs text-gray-600">No windows added yet</p>
  )}
</div>

        </div>
      </section>
    </div>
  );
}
