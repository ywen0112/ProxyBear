"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  startTopup,
  refreshSessionBalance,
  getActivePayment,
  expirePayment,
  type ActivePaymentResponse,
} from "../api/topup";

function formatRemaining(ms: number) {
  if (ms <= 0) return "已过期";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}小时${mm}分`;
  }
  return `${m}分${r}秒`;
}

export default function TopupPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needBilling, setNeedBilling] = useState<boolean>(false); // 后面可替换成真实账单检测
  const [rate, setRate] = useState<number>(1);
  const [creditPreview, setCreditPreview] = useState<number>(0);
  const [active, setActive] = useState<Extract<ActivePaymentResponse, { hasActive: true }> | null>(null);
  const [resuming, setResuming] = useState(false);
  const [expiring, setExpiring] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  // 页面挂载：刷新余额 + 检查是否有未完成的支付
  useEffect(() => {
    refreshSessionBalance().catch(() => {});
    // setNeedBilling(true/false) // 可在此替换为真实接口
    (async () => {
      try {
        const ap = await getActivePayment();
        if (ap.hasActive) setActive(ap);
      } catch (e: any) {
        console.warn('[active-payment]', e?.message);
      }
    })();
  }, []);

  // 倒计时（每秒刷新一次）
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = useMemo(() => {
    if (!active) return 0;
    const end = new Date(active.expiresAt).getTime();
    return end - now;
  }, [active, now]);

  useEffect(() => {
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0) setCreditPreview(0);
    else setCreditPreview(Math.floor(v * rate));
  }, [amount, rate]);

  const invalid = useMemo(() => {
    const v = Number(amount);
    if (!Number.isFinite(v)) return "请输入正确的金额";
    if (v < 0) return "金额不能为负数";
    return null;
  }, [amount]);

  function setQuick(a: number) {
    setAmount(String(a));
  }

  async function onCryptoTopup() {
    setError(null);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (needBilling) {
      setError("需要先完善账单信息");
      return;
    }

    setLoading(true);
    try {
      const resp = await startTopup(Number(amount), { autoRedirect: true });
      if (resp?.rate) setRate(resp.rate);
      // 若设置 autoRedirect=false，可在此 setActive(resp) 并显示“继续支付”
    } catch (e: any) {
      setError(e?.message || "充值失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  function onResume() {
    if (!active) return;
    setResuming(true);
    try {
      // 直接跳转到收银台
      window.location.assign(active.paymentUrl);
    } finally {
      setResuming(false);
    }
  }

  async function onExpire() {
    if (!active) return;
    setExpiring(true);
    try {
      await expirePayment(active.transactionId);
      setActive(null);
    } catch (e: any) {
      setError(e?.message || "取消失败，请稍后重试");
    } finally {
      setExpiring(false);
    }
  }

  const activeExpired = active ? remainingMs <= 0 : false;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>存款余额</CardTitle>
              <p className="text-sm text-muted-foreground">使用加密货币为您的账户充值</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {active && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                  <div className="mb-2 font-medium text-amber-800">
                    检测到一笔未完成的充值（订单 {active.orderId}）
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-amber-700">
                      {activeExpired ? (
                        "该链接已过期，请重新创建充值。"
                      ) : (
                        <>
                          链接将在 <span className="font-semibold">{formatRemaining(remainingMs)}</span> 后过期。
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="bg-green-500 hover:bg-green-600"
                        disabled={resuming || activeExpired}
                        onClick={onResume}
                      >
                        {resuming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        继续支付
                      </Button>
                      <Button variant="outline" disabled={expiring} onClick={onExpire}>
                        {expiring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        取消本次
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="$0.00"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="ml-auto text-xs text-muted-foreground">服务费以支付渠道为准</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[10, 25, 50, 100, 200, 500].map((v) => (
                    <Button key={v} type="button" variant="outline" size="sm" onClick={() => setQuick(v)}>
                      ${v}
                    </Button>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  预计获得 <span className="font-medium text-foreground">{creditPreview}</span> credits
                  <span className="ml-1">(当前汇率 {rate} credits / USD，最终以到账回调为准)</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={onCryptoTopup}
                  disabled={!!invalid || loading || needBilling}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  使用加密货币充值
                </Button>
                {invalid && !loading && <p className="text-xs text-red-600">{invalid}</p>}
                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

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
                  <Button variant="outline" className="w-full" onClick={() => router.push("/settings/billing")}>
                    + 添加账单信息
                  </Button>
                </div>
              )}

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

          <Card className="flex flex-col justify-center items-center text-center">
            <CardContent className="space-y-4">
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
  );
}
