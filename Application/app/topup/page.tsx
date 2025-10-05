"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

export default function TopupPage() {
  const [amount, setAmount] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧 - 充值区 */}
          <Card>
            <CardHeader>
              <CardTitle>存款余额</CardTitle>
              <p className="text-sm text-muted-foreground">
                使用加密货币或 Stripe 为您的账户充值
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 输入金额 */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="$0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="ml-auto text-xs text-muted-foreground">
                  Stripe 增值税 (0%)
                </span>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  使用加密货币充值
                </Button>
              </div>

              {/* 账单警告 */}
              <div className="border bg-muted p-3 rounded-md space-y-2">
                <div className="flex items-center text-sm text-yellow-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  需要账单信息才能继续订单。
                </div>
                <p className="text-xs text-muted-foreground">
                  需要提供账单信息才能继续下单。
                  <br />
                  Требуется платёжная информация для продолжения оформления заказа。
                  <br />
                  Se requiere información de facturación para continuar con el pedido。
                </p>
                <Button variant="outline" className="w-full">
                  + 添加账单信息
                </Button>
              </div>

              {/* 支持的加密货币 */}
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">支持的加密货币:</p>
                <ul className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                  <li>BTC = BTC 网络</li>
                  <li>ETH = ERC20 网络</li>
                  <li>USDC = ERC20 网络</li>
                  <li>Dogecoin = Dogecoin 网络</li>
                  <li>LTC = LTC 网络</li>
                  <li>DAI = ERC20 网络</li>
                  <li>BCH = 比特币现金网络</li>
                  <li>USDT = ERC20 网络</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 右侧 - 好处区 */}
          <Card className="flex flex-col justify-center items-center text-center">
            <CardContent className="space-y-4">
              {/* 插画占位 */}
              <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">[ 插画 ]</span>
              </div>
              <h3 className="font-semibold">充值余额的好处</h3>
              <p className="text-sm text-muted-foreground">
                通过充值余额，用户可以获得多种优势。
                避免每次购买都要经过钱包和区块链确认的麻烦，
                大大提升使用体验。
              </p>
              <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground text-left">
                <li>✓ 延长使用时间</li>
                <li>✓ 预算控制</li>
                <li>✓ 节省费用</li>
                <li>✓ 持续访问</li>
                <li>✓ 方便快捷</li>
                <li>✓ 减少手续费</li>
                <li>✓ 更快交易</li>
                <li>✓ 节省时间</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
