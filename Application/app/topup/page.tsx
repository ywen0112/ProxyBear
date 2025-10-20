"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2 } from "lucide-react"
import { startTopup, refreshSessionBalance, getBalance } from "../api/topup"

export default function TopupPage() {
  const router = useRouter()
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needBilling, setNeedBilling] = useState<boolean>(false) // 这里先用假数据。你可以在 useEffect 拉取用户是否有账单信息。
  const [rate, setRate] = useState<number>(1) // 默认 1 USD = 1 credit；创建发票返回会告诉你真实 rate
  const [creditPreview, setCreditPreview] = useState<number>(0)

  // 可选：页面挂载后刷新一次余额，保证 sessionStorage.user.credit 是最新
  useEffect(() => {
    refreshSessionBalance().catch(() => {})
    // 模拟：是否缺账单信息（你也可以根据 /api/user/billing-info 判断）
    // setNeedBilling(true/false)
  }, [])

  // 计算预计 credits（仅提示，最终以 webhook 为准）
  useEffect(() => {
    const v = Number(amount)
    if (!Number.isFinite(v) || v <= 0) {
      setCreditPreview(0)
    } else {
      setCreditPreview(Math.floor(v * rate))
    }
  }, [amount, rate])

  const invalid = useMemo(() => {
    const v = Number(amount)
    if (!Number.isFinite(v)) return "请输入正确的金额"
    if (v < 0) return "金额不能为负数"
    if (v > 100000) return "金额过大，请分多次充值"
    return null
  }, [amount])

  function setQuick(a: number) {
    setAmount(String(a))
  }

  async function onCryptoTopup() {
    setError(null)
    if (invalid) {
      setError(invalid)
      return
    }
    if (needBilling) {
      setError("需要先完善账单信息")
      return
    }

    setLoading(true)
    try {
      // 自动跳转到 Cryptomus 收银台
      const resp = await startTopup(Number(amount), { autoRedirect: true })
      // 若你不想当前窗口跳走，可以把 autoRedirect false，然后 window.open(resp.paymentUrl, "_blank")
      // 同步一下 rate（给用户看一个“以最终回调为准”的估算）
      if (resp?.rate) setRate(resp.rate)
    } catch (e: any) {
      setError(e?.message || "充值失败，请稍后再试")
    } finally {
      setLoading(false)
    }
  }

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
                使用加密货币为您的账户充值
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 输入金额 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="$0.00"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {/* 税率文案留空或自定义；加密充值通常没有 Stripe 税 */}
                  <span className="ml-auto text-xs text-muted-foreground">
                    服务费以支付渠道为准
                  </span>
                </div>

                {/* 快捷金额 */}
                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 100, 200, 500].map((v) => (
                    <Button key={v} type="button" variant="outline" size="sm" onClick={() => setQuick(v)}>
                      ${v}
                    </Button>
                  ))}
                </div>

                {/* 预计获得 */}
                <div className="text-sm text-muted-foreground">
                  预计获得 <span className="font-medium text-foreground">{creditPreview}</span> credits
                  <span className="ml-1">(当前汇率 {rate} credits / USD，最终以到账回调为准)</span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={onCryptoTopup}
                  disabled={!!invalid || loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  使用加密货币充值
                </Button>
                {invalid && !loading && (
                  <p className="text-xs text-red-600">{invalid}</p>
                )}
                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* 账单信息提示（需要时显示） */}
              {needBilling && (
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/settings/billing")}
                  >
                    + 添加账单信息
                  </Button>
                </div>
              )}

              {/* 支持的加密货币（展示用，可以简化为你实际开放的） */}
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">支持的加密货币:</p>
                <ul className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                  <li>USDT = TRC20（推荐手续费低）</li>
                  <li>BTC = BTC 网络</li>
                  <li>ETH = ERC20 网络</li>
                  <li>USDC = ERC20 网络</li>
                  <li>DAI = ERC20 网络</li>
                  <li>LTC = LTC 网络</li>
                  <li>BCH = 比特币现金网络</li>
                  <li>DOGE = Dogecoin 网络</li>
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
                通过充值余额，您可以避免每次购买都反复链上确认，体验更流畅，并可获得手续费/汇率优惠。
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
