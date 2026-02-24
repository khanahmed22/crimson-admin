

import { supabase } from "@/db/supabase"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useAuth } from "@/store/authStore"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2, Plus, Tag, Sparkles } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Title } from "react-head"

export default function CategoryManager() {
  const { session } = useAuth()
  const user_id = session?.user?.id
  const [newCategory, setNewCategory] = useState("")
  const queryClient = useQueryClient()

  const fetchCategory = async () => {
    try {
      const { data: catData, error } = await supabase.from("category").select("*").eq("user_id", user_id)
      if (error) throw error
      return catData
    } catch (err) {
      console.log(err)
    }
  }

  const { data: catQuery, isPending } = useQuery({
    queryKey: ["catData"],
    queryFn: fetchCategory,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    enabled: !!user_id
  })

  const addCategory = async ({ category }) => {
    try {
      const { data: catData, error } = await supabase
        .from("category")
        .insert([{ catName: category, user_id: user_id, catID: uuidv4() }])
        .select("*")
      if (error) throw error
      return catData
    } catch (err) {
      console.log(err)
    }
  }

  const { mutate: addCat } = useMutation({
    mutationKey: ["addCategory"],
    mutationFn: addCategory,
    onSuccess: () => {
      toast.success("Category Added")
      queryClient.invalidateQueries(["catData", user_id])
    },
    staleTime: 1000 * 60 * 5,
    
  })

  const deleteCategory = async ({ id }) => {
    try {
      const { data: catData, error } = await supabase.from("category").delete().eq("catID", id).eq("user_id", user_id)
      if (error) throw error
      return catData
    } catch (err) {
      console.log(err)
    }
  }

  const { mutate: deleteCat } = useMutation({
    mutationKey: ["deleteCategory"],
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category Deleted")
      queryClient.invalidateQueries(["catData", user_id])
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!newCategory.trim()) {
      toast.error("Please enter a category name")
      return
    }
    addCat({ category: newCategory.trim() })
    setNewCategory("")
  }

  if (isPending) {
    return (
      <div className="max-md:mt-10">
        <Title>Category Manager</Title> 
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">Loading categories...</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Title>Category Manager</Title> 
    <div className="min-h-screen  p-6 max-md:p-2 max-md:mt-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-x-3">
            <div className="inline-flex items-center justify-center mt-3 w-16 h-16 max-md:w-14 max-md:h-14 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
              <Tag className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
            </div>
            <h1 className="text-2xl max-md:text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Category Manager
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-md:text-sm">Organize your menu items with custom categories</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl max-md:text-lg font-semibold text-gray-800">Categories</h2>
            {/*<div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm max-md:text-xs font-medium">
              {catQuery?.length || 0} categories
            </div>*/}
          </div>

          {!isPending && catQuery?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catQuery.map((c, i) => (
                <div
                  key={i}
                  className="group bg-gradient-to-r from-white to-rose-50 rounded-xl p-6 border border-rose-100 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-orange-400 rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-white max-md:w-3 max-md:h-3" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg max-md:text-sm">{c.catName}</h3>
                        <p className="text-gray-500 text-sm max-md:text-xs">Menu category</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteCat({ id: c.catID })}
                
                      size="sm"
                      className=""
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-600 mb-2">No categories yet</h3>
              <p className="text-gray-500 max-md:text-sm">Create your first category to get started organizing your menu</p>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl max-md:text-sm font-semibold text-gray-800">Add New Category</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="category-input" className="block text-sm max-md:text-xs font-medium text-gray-700">
                Category Name
              </label>
              <Input
                id="category-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name (e.g., Appetizers, Main Courses)"
                className="h-12 text-lg border-2 max-md:text-xs border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 max-md:text-sm bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={!newCategory.trim()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}
