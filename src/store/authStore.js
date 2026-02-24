import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../db/supabase";

export const useAuth = create(
  persist(
    (set) => ({
      session: null,
      role: null,
      isLoading: true,
      isError: null,
      cart: [],
      theme: "blue", // default theme
      mobileMode: false,

      setMobileMode: (value) => set({ mobileMode: value }),

      // --- Cart actions ---
       addToCart: (item) => {
  set((state) => {
    const cart = Array.isArray(state.cart) ? state.cart : [];

    // --- Unique cart item key ---
    const optionIds = item.options?.map((o) => o.id).sort().join("-") || "";
    const variantKey =
      item.variant || item.size || item.selectedVariant?.id || "";

    const cartItemID = `${item.itemID}${
      variantKey ? `-${variantKey}` : ""
    }${optionIds ? `-${optionIds}` : ""}`;

    const existingItem = cart.find((c) => c.cartItemID === cartItemID);
    const addQty = Number(item.quantity ?? 1);

    // --- Base price ---
    const basePrice = Number(item.basePrice ?? item.price ?? 0);

    // --- Variant handling ---
    let variantPrice = basePrice;
    if (item.selectedVariant) {
      const v = item.selectedVariant;

      if (!isNaN(Number(v.price)) && Number(v.price) > 0) {
        // Variant has its own full price
        variantPrice = Number(v.price);
      } else if (!isNaN(Number(v.extra_price)) && Number(v.extra_price) > 0) {
        // Variant adds to base price
        variantPrice = basePrice + Number(v.extra_price);
      } else {
        variantPrice = basePrice; // fallback
      }
    }

    // --- Addons / Options ---
    const optionsPrice =
      item.options?.reduce((sum, opt) => {
        const ep = Number(opt.extra_price ?? 0);
        return sum + (isNaN(ep) ? 0 : Math.max(0, ep));
      }, 0) || 0;


    const costPrice =
      item.options?.reduce((sum, opt) => {
        const ep = Number(opt.costPrice ?? 0);
        return sum + (isNaN(ep) ? 0 : Math.max(0, ep));
      }, 0) || 0;

    const BaseCostPrice = item.BaseCostPrice || 0;

    // --- Final per-unit price ---
    const finalPrice = Math.max(0, Math.round(variantPrice + optionsPrice));

    // --- Update cart ---
    if (existingItem) {
      return {
        cart: cart.map((c) =>
          c.cartItemID === cartItemID
            ? { ...c, quantity: Number(c.quantity ?? 0) + addQty }
            : c
        ),
      };
    }

    
    

    // --- Add new item ---
    return {
      cart: [
        ...cart,
        {
          ...item,
          price: finalPrice,
          basePrice,
          variantPrice,
          optionsPrice,
          quantity: addQty,
          cartItemID,
          variant: variantKey || null,
          costPrice: Number(costPrice ?? 0),
          BaseCostPrice: Number(BaseCostPrice ?? 0)

        },
      ],
    };
  });
},



      removeFromCart: (cartItemID) => {
        set((state) => {
          const cart = Array.isArray(state.cart) ? state.cart : [];
          const existingItem = cart.find((c) => c.cartItemID === cartItemID);
          if (!existingItem) return { cart };

          if (existingItem.quantity > 1) {
            return {
              cart: cart.map((c) =>
                c.cartItemID === cartItemID
                  ? { ...c, quantity: Number(c.quantity ?? 0) - 1 }
                  : c
              ),
            };
          }

          return { cart: cart.filter((c) => c.cartItemID !== cartItemID) };
        });
      },

      deleteFromCart: (cartItemID) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.cartItemID !== cartItemID),
        })),

      clearCart: () => set({ cart: [] }),

      // --- Session ---
      fetchSession: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;

          let role = null;
          if (data.session?.user) {
            
            const { data: merchant, error: merchantError } = await supabase
              .from("merchant_accounts")
              .select("merchant_verify")
              .eq("merchant_id", data.session.user.id)
              .single();

            if (!merchantError && merchant) {
              // role replaced with verification status or your own role column
              role = merchant.merchant_verify || "unverified";
            }
          }

          set({ session: data.session, role, isLoading: false });
        } catch (err) {
          console.error("Fetch session error:", err);
          set({ isError: err.message, isLoading: false });
        }
      },

      // --- Theme actions ---
      fetchTheme: async (subdomain) => {
        if (!subdomain) return;
        try {
          const { data, error } = await supabase
            .from("rest_list")
            .select("restTheme")
            .eq("subdomain", subdomain)
            .single();

          if (!error && data) {
            set({ theme: data.restTheme || "blue" });
          }
        } catch (err) {
          console.error("Error fetching theme:", err);
        }
      },

      saveTheme: async (subdomain, newTheme) => {
        if (!subdomain) return;
        try {
          const { error } = await supabase
            .from("rest_list")
            .update({ restTheme: newTheme })
            .eq("subdomain", subdomain);

          if (!error) set({ theme: newTheme });
        } catch (err) {
          console.error("Error saving theme:", err);
        }
      },

      // --- Sign out ---
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, role: null, cart: [], theme: "blue" });
        window.location.href = "/sign-in";
      },
    }),
    {
      name: "authSession",
      partialize: (state) => ({
        session: state.session,
        role: state.role,
        cart: state.cart,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("Rehydration error:", error);
      },
    }
  )
);
