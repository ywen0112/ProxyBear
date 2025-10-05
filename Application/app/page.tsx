"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Price {
  size?: number
  price: number
  priceType?: string
  pricePerUnit?: string
  plan?: string
  visibleToGuest?: boolean
}

interface SubCategory {
  name: string
  pricingType: string
  prices: Price[]
}

interface RawProduct {
  _id: string
  name: string
  category?: string
  description: {
    short?: string
    long?: string
    long2?: string
    features?: string[] | string 
  }
  subCategories?: SubCategory[] 
  directPrices?: Price[]         
  createdAt?: string
  price?: number                  
}

export default function HomePage() {
  const [products, setProducts] = useState<RawProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8210/api/products")
        setProducts(response.data)
        setLoading(false)
      } catch (err: any) {
        console.error(err)
        setError("Failed to load products. Please try again later.")
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const getPriceInfo = (product: RawProduct) => {
    if (product.price !== undefined) {
      return {
        price: product.price.toString(),
        priceType: "",
        pricePerUnit: ""
      }
    }

    if (product.subCategories) {
      for (const sub of product.subCategories) {
        const visible = sub.prices.find(p => p.visibleToGuest)
        if (visible) {
          return {
            price: visible.price.toString(),
            priceType: visible.priceType || "",
            pricePerUnit: visible.pricePerUnit || ""
          }
        }
      }
    }

    if (product.directPrices) {
      const visible = product.directPrices.find(p => p.visibleToGuest)
      if (visible) {
        return {
          price: visible.price.toString(),
          priceType: visible.priceType || "",
          pricePerUnit: visible.pricePerUnit || ""
        }
      }
    }

    return { price: "N/A", priceType: "", pricePerUnit: "" }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-8 leading-tight">
            欢迎体验Proxybear
            <span className="block text-accent">的代理产品</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            Proxybear提供安全、高效的代理产品，助力企业应对网络爬虫、数据采集和全球内容访问需求。
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90" asChild>
            <Link href="/register">立即注册</Link>
          </Button>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const { price, priceType, pricePerUnit } = getPriceInfo(product)

              return (
                <ProductCard
                  key={product._id}
                  productId={product._id}
                  title={product.name}
                  description={product.description.long || ""}
                  features={
                    Array.isArray(product.description.features)
                      ? product.description.features
                      : product.description.features
                        ? (product.description.features as string).split("\n")
                        : []
                  }
                  price={price}
                  priceType={priceType}
                  pricePerUnit={pricePerUnit}
                />
              )
            })}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Proxybear. 保留所有权利。
        </div>
      </footer>
    </div>
  )
}
