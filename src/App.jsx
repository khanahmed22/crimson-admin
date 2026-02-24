import { Route, Routes, Outlet, Navigate } from "react-router";
import HomePage from "./pages/Home";
import SignIn from "./authPages/SignIn";
import SignUp from "./authPages/SignUp";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "sonner";
import SideBar from "./components/Sidebar";
import { supabase } from "./db/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./store/authStore";
import { useEffect, lazy,Suspense } from "react";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import OfflineBanner from "./components/OfflineBanner";
import LiveOrders from "./pages/LiveOrders";


function DashboardLayout() {
   

  return (
    <div className="min-h-screen flex max-md:flex-col">
      {/* Sidebar */}
      <div className="w-64 max-md:w-full max-md:mb-4">
        <SideBar  />
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}

function App() {
   
  const { session } = useAuth();
  const user_id = session?.user?.id;

  //account pages

  const NewPassword = lazy(()=> import('./authPages/NewPassword'))
  const MerchantReg = lazy(()=> import('./pages/MerchantReg'))
  const ForgetPassword = lazy(()=> import('./authPages/ForgotPassword'))
  const KnowledgeBase = lazy(()=> import('./policyPages/KnowledgeBase'))

  //admin pages

  
  const Account = lazy(() => import("./authPages/Account"));
  const Settings = lazy(() => import("./pages/Settings"));

  const PlaceOrder = lazy(()=>import("./pages/PlaceOrder"))
  const Inventory = lazy(()=> import("./pages/Inventory"))
  const Sales = lazy(()=> import("./pages/Sales"))
  const CategoryManager = lazy(()=> import("./pages/CategoryManager"))
  const DeliveryCharges = lazy(()=> import("./pages/DeliveryCharges"))
  const CouponManager = lazy(()=> import('./pages/CouponManager'))
  const Customers = lazy(()=> import("./pages/Customers"))
  const Riders = lazy(()=> import("./pages/Rider"))
  const Help = lazy(()=> import("./pages/Help"))
  
  //policy pages

  const DeliveryPolicy = lazy(()=> import('./policyPages/DeliveryPolicy'))
  const CancellationPolicy = lazy(()=> import('./policyPages/CancellationPolicy'))
  const RefundPolicy = lazy(()=> import('./policyPages/RefundPolicy'))
  const PrivacyPolicy = lazy(()=> import('./policyPages/PrivacyPolicy'))
  const TermsConditions = lazy(()=> import('./policyPages/TermsConditions'))
  const ContactUs = lazy(()=> import('./pages/Contact'))



  
  

  // Fetch restaurant logo for favicon
  const fetchRestLogo = async () => {
    const { data, error } = await supabase
      .from("rest_list")
      .select("restLogo")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;
    return data?.restLogo || null;
  };

  const { data: restLogo } = useQuery({
    queryKey: ["restLogo", user_id],
    queryFn: fetchRestLogo,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
  });

  // Update favicon
  useEffect(() => {
    if (restLogo) {
      const link =
        document.querySelector("link[rel='icon']") || document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = restLogo;
      document.head.appendChild(link);
    }
  }, [restLogo]);





  // ✅ Fetch merchant verification status
  const { data: merchantStatus} = useQuery({
    queryKey: ["merchantStatus", user_id],
    queryFn: async () => {
      if (!user_id) return "unverified"
      const { data, error } = await supabase
        .from("merchant_accounts")
        .select("merchant_verify")
        .eq("merchant_id", user_id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  })
 
  return (
    <>
      <ScrollToTop />
      <OfflineBanner />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />

        <Route
          path="/knowledge-base"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <KnowledgeBase />
            </Suspense>
          }
        />
        

      
        <Route
          path="/contact-us"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <ContactUs />
            </Suspense>
          }
        />
        <Route
          path="/terms-conditions"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <TermsConditions/>
            </Suspense>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <PrivacyPolicy />
            </Suspense>
          }
        />
        <Route
          path="/refund-policy"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <RefundPolicy/>
            </Suspense>
          }
        />
        <Route
          path="/cancellation-policy"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <CancellationPolicy />
            </Suspense>
          }
        />
        <Route
          path="/delivery-policy"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <DeliveryPolicy />
            </Suspense>
          }
        />
        <Route
          path="/sign-in"
          element={session ? <Navigate to="/dashboard" replace /> : <SignIn />}
        />
        <Route
          path="/sign-up"
          element={session ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />
        <Route
          path="/password-recovery"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <ForgetPassword />
            </Suspense>
          }
        />
        <Route
          path="/new-password"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <NewPassword />
            </Suspense>
          }
        />
        <Route
          path="/merchant-reg"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              }
            >
              <MerchantReg />
            </Suspense>
          }
        />
         
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
           
              <Route
                path="/settings"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <Settings />
                  </Suspense>
                }
              />
  

            <Route path="/live-orders" element={<LiveOrders/>}></Route>
            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/place-order"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <PlaceOrder />
                  </Suspense>
                }
              />
            )}


            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/analytics"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <Sales />
                  </Suspense>
                }
              />
            )}
           {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/inventory"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <Inventory />
                  </Suspense>
                }
              />
            )}
            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/category-manager"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <CategoryManager />
                  </Suspense>
                }
              />
            )}
            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/delivery-charges"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <DeliveryCharges />
                  </Suspense>
                }
              />
            )}
            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/coupon-manager"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <CouponManager />
                  </Suspense>
                }
              />
            )}

            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/help"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <Help />
                  </Suspense>
                }
              />
            )}

            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/customers"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <Customers/>
                  </Suspense>
                }
              />
            )}

            {merchantStatus?.merchant_verify !== "verified" ? null : (
              <Route
                path="/riders"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                      </div>
                    }
                  >
                    <Riders/>
                  </Suspense>
                }
              />
            )}
            <Route
              path="/account"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                  }
                >
                  <Account />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
