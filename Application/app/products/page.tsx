// app/products/page.tsx
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Navigation } from "@/components/navigation"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface Price {
  size: number
  price: number
  plan?: string
  visibleToGuest: boolean
}

interface SubCategory {
  name: string
  pricingType: string
  prices: Price[]
}

interface RawProduct {
  _id: string
  name: string
  description: {
    short?: string
    long?: string
    long2?: string
    features?: string[] | string
  }
  subCategories?: SubCategory[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<RawProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = sessionStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }
        const res = await axios.get(`http://localhost:8210/api/products/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProducts(res.data)
        setLoading(false)
      } catch {
        setError("Failed to load products. Please try again later.")
        setLoading(false)
      }
    }
    fetchProducts()
  }, [router])

  if (loading) return <div className="pt-32 text-center">Loading...</div>
  if (error) return <div className="pt-32 text-center text-red-500">{error}</div>

  const categories = Array.from(new Set(products.map((p) => p.name)))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="flex flex-wrap justify-center mb-10 gap-2">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((cat) => {
            const product = products.find((p) => p.name === cat)
            if (!product) return null
            const features = Array.isArray(product.description.features)
              ? product.description.features
              : typeof product.description.features === "string"
              ? product.description.features.split("\n")
              : []
            return (
              <TabsContent key={cat} value={cat}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.subCategories?.map((sub, idx) =>
                    sub.prices.map((priceObj, i) => (
                      <Card
                        key={`${idx}-${i}`}
                        className="p-6 border rounded-xl shadow hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">
                            {sub.name} {priceObj.size}
                            {sub.pricingType}
                          </h3>
                          <p className="text-xl font-bold text-primary">
                            ${priceObj.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {product.description.long}
                        </p>
                        <ul className="text-sm text-gray-700 mb-6 space-y-1">
                          {features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-blue-500" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          onClick={() =>
                            router.push(
                              `/checkout/${product._id}?sub=${encodeURIComponent(
                                sub.name
                              )}&size=${priceObj.size}&price=${
                                priceObj.price
                              }&pricingType=${sub.pricingType}`
                            )
                          }
                        >
                          Purchase Plan
                        </Button>
                        <p className="text-xs text-gray-400 text-center mt-3">
                          Terms & conditions apply
                        </p>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
