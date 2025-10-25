// src/app/invoice/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, XCircle, CheckCircle2, Clock } from "lucide-react";
import { getMyTransactions, type TxItem } from "../api/invoice";
import { expirePayment } from "../api/topup"; // 你已有
import { cn } from "@/lib/utils";

function fmt(t?: string) {
  if (!t) return "-";
  try { return new Date(t).toLocaleString(); } catch { return t; }
}

function isExpired(tx: TxItem) {
  if (!tx.expiresAt) return false;
  return Date.now() > new Date(tx.expiresAt).getTime();
}

export default function InvoicePage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<TxItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(""); // 过滤
  const [type, setType] = useState<string>("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load(p = page) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await getMyTransactions({ page: p, limit: 20, status, type });
      setList(res.items);
      setPage(res.page);
      setPages(res.pages);
    } catch (e: any) {
      setError(e?.response?.data?.message || "加载交易失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type]);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < pages, [page, pages]);

  async function onCancel(tx: TxItem) {
    if (!confirm(`确认取消订单 ${tx.orderId} 吗？`)) return;
    setActingId(tx._id);
    setError(null);
    setSuccess(null);
    try {
      await expirePayment(tx._id);
      setSuccess("已取消该订单");
      await load(page);
    } catch (e: any) {
      setError(e?.response?.data?.message || "取消失败");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">发票 / 交易记录</h1>
          <div className="flex gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="pending">待支付</option>
              <option value="completed">已完成</option>
              <option value="expired">已过期</option>
              <option value="failed">失败</option>
            </select>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">全部类型</option>
              <option value="recharge">充值</option>
              <option value="purchase">购买</option>
              <option value="refund">退款</option>
            </select>
            <Button variant="outline" onClick={() => load(1)}>
              刷新
            </Button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}

        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-12 gap-0 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
            <div className="col-span-2">时间</div>
            <div className="col-span-2">类型</div>
            <div className="col-span-2">金额(USD)</div>
            <div className="col-span-2">状态</div>
            <div className="col-span-2">订单号</div>
            <div className="col-span-2 text-right pr-2">操作</div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
              正在载入…
            </div>
          ) : list.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无交易
            </div>
          ) : (
            list.map((tx) => {
              const expired = isExpired(tx);
              const pending = tx.status === "pending";
              const canResume = pending && !expired && tx.paymentUrl;
              const canCancel = pending;

              return (
                <div
                  key={tx._id}
                  className="grid grid-cols-12 gap-0 border-t px-4 py-3 text-sm"
                >
                  <div className="col-span-2">{fmt(tx.createdAt)}</div>
                  <div className="col-span-2">{tx.type}</div>
                  <div className="col-span-2">${Number(tx.amount).toFixed(2)}</div>
                  <div className="col-span-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded px-2 py-0.5 text-xs",
                        tx.status === "completed" && "bg-green-100 text-green-700",
                        tx.status === "pending" && "bg-amber-100 text-amber-700",
                        tx.status === "expired" && "bg-gray-100 text-gray-700",
                        tx.status === "failed" && "bg-red-100 text-red-700"
                      )}
                    >
                      {tx.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {tx.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {tx.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                      {tx.status}
                    </span>
                  </div>
                  <div className="col-span-2 truncate" title={tx.orderId}>
                    {tx.orderId}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {canResume && (
                      <Button
                        size="sm"
                        onClick={() => window.open(tx.paymentUrl!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        继续支付
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actingId === tx._id}
                        onClick={() => onCancel(tx)}
                      >
                        {actingId === tx._id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            处理中…
                          </>
                        ) : (
                          "取消"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Card>

        {/* 分页 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            第 {page} / {pages} 页
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!canPrev} onClick={() => { setPage(page - 1); load(page - 1); }}>
              上一页
            </Button>
            <Button variant="outline" disabled={!canNext} onClick={() => { setPage(page + 1); load(page + 1); }}>
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
