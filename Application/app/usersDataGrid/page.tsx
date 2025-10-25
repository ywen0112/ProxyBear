"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// 定义接口类型
// interface PricingData {
//   residentialPerGb: number
//   mobilePerGb: number
//   ispPerIp: number
//   ipv6UnlimitedPlans: Record<string, Record<string, number>>
//   ipv6BandwidthPerGb?: number | null
// }

interface ProductDescription {
  short?: string
  long?: string
  long2?: string
  features?: string[] | string
}

interface RawProduct {
  _id: string
  name: string
  category?: string
  description: ProductDescription
  createdAt?: string
}

// 前端页面
export default function UsersDataGrid() {
  const [products, setProducts] = useState<RawProduct[]>([])
  // const [pricing, setPricing] = useState<PricingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes] = await Promise.all([
          axios.get("http://localhost:8210/api/products"),
          // axios.get("http://localhost:8210/api/config/pricing"),
        ])
        setProducts(productRes.data)
        // setPricing(pricingRes.data)
      } catch (err: any) {
        console.error(err)
        setError("加载产品失败，请稍后再试。")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 获取显示价格
  // const getDisplayPrice = (product: RawProduct) => {
  //   if (!pricing) return "—"

  //   switch (product.category?.toLowerCase()) {
  //     case "residential":
  //       return `$${pricing.residentialPerGb} / GB`
  //     case "mobile":
  //       return `$${pricing.mobilePerGb} / GB`
  //     case "ipv6":
  //       return "按流量或不限速率"
  //     case "isp":
  //       return `$${pricing.ispPerIp} / IP`
  //     default:
  //       return "N/A"
  //   }
  // }

  if (loading) return <div className="pt-32 text-center">加载中...</div>
  if (error) return <div className="pt-32 text-center text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-8 leading-tight">
            欢迎体验 Proxybear
            <span className="block text-accent">的代理产品</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            Proxybear 提供安全、高效的代理服务，助力企业应对网络爬虫、数据采集和全球访问需求。
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90" asChild>
            <Link href="/register">立即注册</Link>
          </Button>
        </div>
      </section>

      {/* 产品展示区 */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              // const displayPrice = getDisplayPrice(product)
              const features = Array.isArray(product.description.features)
                ? product.description.features
                : typeof product.description.features === "string"
                ? product.description.features.split("\n")
                : []

              return (
                <ProductCard
                  key={product._id}
                  productId={product._id}
                  title={product.name}
                  description={product.description.long || ""}
                  features={features}
                  // price={displayPrice}
                  // priceType="" // 已包含在 displayPrice 里
                  // pricePerUnit=""
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Proxybear. 保留所有权利。
        </div>
      </footer>
    </div>
  )
}
