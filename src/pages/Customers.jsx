import { supabase } from "@/db/supabase"
import { useQuery } from "@tanstack/react-query"
import { Title } from "react-head"
import { useAuth } from "@/store/authStore";
import { Mail, PersonStanding } from "lucide-react";

export default function Customers(){

  const {session} = useAuth()

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
      gcTime: 1000 * 60 * 5,
    });
  
    const restID = restIDQuery?.id

  

  const fetchCustomers = async()=>{
    const {data,error} = await supabase
      .from('customer_accounts')
      .select('*')
      .eq('restID',restID)
    

      if(error) throw error
      return data
  }

  const {data:custQuery,isPending} = useQuery({
    queryKey: ['custQuery',restID],
    queryFn: fetchCustomers,
    enabled: !!restID,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    

  })

  if (isPending) {
      return (
        <div>
          <Title>Customers</Title>
          <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
            <div className="max-w-4xl mx-auto ">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                    Loading Customers...
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  return(
    <div className="min-h-screen  p-6">
      <Title>Customers</Title>
  <div className="flex items-center justify-center gap-x-3 mt-10">
            <div className="inline-flex items-center justify-center mt-3 w-16 h-16 max-md:w-14 max-md:h-14 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
              <PersonStanding className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
            </div>
            <h1 className="text-2xl max-md:text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              My Customers
            </h1>
          </div>

  <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {!isPending && custQuery?.length > 0 ? (
      custQuery.map((c, i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-white/30 p-6"
        >
          <div className="flex flex-col items-start space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              {c.full_name || "Unnamed"}
            </h3>
            <p className="text-gray-600 text-sm flex items-center gap-x-2">
              <Mail size={15}/> {c.email || "No email"}
            </p>
            {c.phone && (
              <p className="text-gray-600 text-sm">📱 {c.phone}</p>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="col-span-full flex flex-col items-center justify-center text-gray-600 bg-white/70 backdrop-blur-sm rounded-2xl shadow-inner p-10">
        <p className="text-lg font-medium mb-2">No Customers yet 😔</p>
        <p className="text-sm text-gray-500">
          Customers will appear here once they sign up.
        </p>
      </div>
    )}
  </div>
</div>

  )
}