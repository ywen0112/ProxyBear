"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [plans, setPlans] = useState(0)
  const [dataUsed, setDataUsed] = useState(0)
  const [dataLimit, setDataLimit] = useState(0)
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUserId(parsedUser.id)
        setUsername(parsedUser.username)
      } catch (err) {
        console.error("Failed to parse user from sessionStorage", err)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div>
            <p className="text-muted-foreground">您好， {username}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Balance Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">主动余额</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1">
                <div className="flex flex-col items-start gap-3">
                  <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => router.push("/topup")}
                  >
                    添加余额
                  </Button>
                </div>
                <div className="border-t pt-2 mt-3 text-sm text-muted-foreground">
                  总支出余额 ${balance.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            {/* Plans Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">现行计划</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1">
                <div className="flex flex-col items-start gap-3">
                  <div className="text-3xl font-bold">{plans}</div>
                  <Button size="sm" onClick={() => router.push("/products")}>
                    购买计划
                  </Button>
                </div>
                <div className="border-t pt-2 mt-3 text-sm text-muted-foreground">
                  购买计划总数 {plans}
                </div>
              </CardContent>
            </Card>

            {/* Data Usage Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">数据剩余</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1">
                <div className="flex flex-col items-start gap-3 w-full">
                  <div className="text-3xl font-bold">
                    {dataUsed.toFixed(2)} GB
                  </div>
                  <Progress
                    value={dataLimit > 0 ? (dataUsed / dataLimit) * 100 : 0}
                    className="h-2 w-full"
                  />
                </div>
                <div className="border-t pt-2 mt-3 text-sm text-muted-foreground">
                  购买的数据总量 {dataLimit.toFixed(2)} GB
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">用户信息</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1">
                <div className="flex flex-col gap-3">
                  <div className="font-medium">{username}</div>
                  <div className="text-sm text-muted-foreground">ID: {userId}</div>
                </div>
                <div className="border-t pt-2 mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    邮箱
                  </Button>
                  <Button size="sm" variant="outline">
                    复制
                  </Button>
                  <Button size="sm" variant="destructive">
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gift Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">您的有效计划</h2>
            <p className="text-muted-foreground mb-4">
              只需单击按钮即可生成代理
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Input placeholder="输入礼包码" className="max-w-xs" />
              <Button>获取你的礼物</Button>
              <Button variant="outline">如何才能获得礼物?</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
