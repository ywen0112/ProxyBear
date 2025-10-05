"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserInfo } from "../../api/user"

interface BillingInfo {
  legalName: string
  legalSurname: string
  billingEmail: string
  phone: string
  address: string
  zip: string
  companyName?: string
  vatNumber?: string
}

export default function CheckoutPage() {
  const { productId } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const sub = searchParams.get("sub")
  const size = searchParams.get("size")
  const price = searchParams.get("price")
  const pricingType = searchParams.get("pricingType")

  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) return

    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.id) return

      getUserInfo(parsedUser.id).then((res) => {
        setBillingInfo(res.billing || null)
      })
    } catch (err) {
      console.error("无法获取用户信息", err)
    }
  }, [])

  const handleConfirm = () => {
    alert("加密货币支付已发起！")
    router.push("/products")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* 产品详情 */}
        <Card className="lg:col-span-1 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">产品详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><span className="font-medium">产品编号：</span>{productId}</p>
            <p><span className="font-medium">子分类：</span>{sub}</p>
            <p><span className="font-medium">规格：</span>{size} {pricingType}</p>
            <p className="text-xl font-bold text-primary">¥{price}</p>
          </CardContent>
        </Card>

        {/* 用户账单信息 */}
        <Card className="lg:col-span-2 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">账单信息</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {billingInfo ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">名字</p>
                  <p className="font-medium">{billingInfo.legalName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">姓氏</p>
                  <p className="font-medium">{billingInfo.legalSurname || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">账单邮箱</p>
                  <p className="font-medium">{billingInfo.billingEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">电话号码</p>
                  <p className="font-medium">{billingInfo.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">账单地址</p>
                  <p className="font-medium">{billingInfo.address || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">邮编</p>
                  <p className="font-medium">{billingInfo.zip || "-"}</p>
                </div>
                {billingInfo.companyName && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">公司名称</p>
                      <p className="font-medium">{billingInfo.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">VAT 编号</p>
                      <p className="font-medium">{billingInfo.vatNumber}</p>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">正在加载账单信息...</p>
            )}
          </CardContent>
        </Card>

        {/* 支付方式 */}
        <Card className="lg:col-span-3 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">支付方式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">加密货币支付</p>
                <p className="text-sm text-muted-foreground">支持 USDT / BTC / ETH</p>
              </div>
              <Button onClick={handleConfirm} className="px-6">
                使用加密支付
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
