// app/purchased/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import axios from "axios";
import {
  ReadResidentialResponse,
  ReadMobileResponse,
  ReadIPv6Response,
  ReadISPResponse,
  readResidential,
  readMobile,
  readIPv6,
  readISP,
  ipv6Whitelist,
} from "../api/purchased";

const API_BASE = "http://localhost:8210/api";

function authHeaders() {
  const raw = sessionStorage.getItem("token");
  const token = raw ? raw.trim().replace(/^"+|"+$/g, "") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type PlanItem = {
  planId: string;
  option: "residential" | "mobile" | "ipv6" | "isp";
  user: string;
  price: number;
  createdAt: string;
};

type PlanDetail =
  | { option: "residential"; data: ReadResidentialResponse }
  | { option: "mobile"; data: ReadMobileResponse }
  | { option: "ipv6"; data: ReadIPv6Response }
  | { option: "isp"; data: ReadISPResponse }
  | { error: string };

type PlanDetailMap = Record<string, PlanDetail>;

export default function PurchasedPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [details, setDetails] = useState<PlanDetailMap>({});
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "residential" | "mobile" | "ipv6" | "isp"
  >("residential");
  const [refreshing, setRefreshing] = useState(false);

  // 全局提示
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // IPv6 白名单本地状态
  const [wlIpByPlan, setWlIpByPlan] = useState<Record<string, string>>({});
  const [wlBusyPlan, setWlBusyPlan] = useState<string | null>(null);

  // 拉取已购计划
  const fetchMyPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<PlanItem[]>(`${API_BASE}/purchase/my-plans`, {
        headers: authHeaders(),
      });
      setPlans(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "载入已购产品失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载或关闭详情
  const toggleDetails = async (planId: string, option: PlanItem["option"]) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
      return;
    }
    if (!details[planId]) {
      try {
        setRefreshing(true);
        let data: any;
        if (option === "residential") data = await readResidential(planId);
        else if (option === "mobile") data = await readMobile(planId);
        else if (option === "ipv6") data = await readIPv6(planId);
        else if (option === "isp") data = await readISP(planId);

        setDetails((prev) => ({
          ...prev,
          [planId]: { option, data },
        }));
      } catch (e: any) {
        setDetails((prev) => ({
          ...prev,
          [planId]: { error: e?.message || "读取失败" },
        }));
        setError(e?.message || "读取失败");
        autoClearMsg();
      } finally {
        setRefreshing(false);
      }
    }
    setExpandedPlan(planId);
  };

  // IPv6 白名单操作
  async function handleIPv6Whitelist(
    planId: string,
    ip: string,
    action: "add" | "remove"
  ) {
    if (!ip) {
      setError("请输入 IP 地址");
      autoClearMsg();
      return;
    }
    try {
      setWlBusyPlan(planId);
      const r = await ipv6Whitelist(planId, ip, action);
      setSuccess(r?.message || (action === "add" ? "白名单添加成功" : "白名单移除成功"));
      autoClearMsg();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "操作失败，请稍后重试");
      autoClearMsg();
    } finally {
      setWlBusyPlan(null);
    }
  }

  // 自动清理提示
  function autoClearMsg() {
    window.setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 2500);
  }

  useEffect(() => {
    fetchMyPlans();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 text-center">
          <Loader2 className="inline-block animate-spin mr-2" /> 正在载入…
        </div>
      </div>
    );

  // 分组
  const grouped: Record<PlanItem["option"], PlanItem[]> = {
    residential: plans.filter((p) => p.option === "residential"),
    mobile: plans.filter((p) => p.option === "mobile"),
    ipv6: plans.filter((p) => p.option === "ipv6"),
    isp: plans.filter((p) => p.option === "isp"),
  };

  const PLAN_KEYS: PlanItem["option"][] = ["residential", "mobile", "ipv6", "isp"];

  const labelMap: Record<PlanItem["option"], string> = {
    residential: "住宅代理",
    mobile: "移动代理",
    ipv6: "IPv6代理",
    isp: "ISP代理",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">已购买产品</h1>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(null);
              setError(null);
              fetchMyPlans();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> 刷新
          </Button>
        </div>

        {/* 全局提示 */}
        {success && (
          <div className="mb-4 text-sm text-green-600 border border-green-300 rounded px-3 py-2 bg-green-50">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-600 border border-red-300 rounded px-3 py-2 bg-red-50">
            {error}
          </div>
        )}

        {plans.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">无购买产品</Card>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              setActiveTab(v as "residential" | "mobile" | "ipv6" | "isp")
            }
            className="w-full"
          >
            <TabsList className="flex flex-wrap justify-center mb-8 gap-2">
              {PLAN_KEYS.map(
                (key) =>
                  grouped[key].length > 0 && (
                    <TabsTrigger key={key} value={key}>
                      {labelMap[key]}
                    </TabsTrigger>
                  )
              )}
            </TabsList>

            {PLAN_KEYS.map(
              (key) =>
                grouped[key].length > 0 && (
                  <TabsContent key={key} value={key}>
                    {grouped[key].map((p) => {
                      const info = details[p.planId];
                      const isExpanded = expandedPlan === p.planId;

                      return (
                        <Card key={p.planId} className="p-6 mb-6 transition hover:shadow-md">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Plan ID</div>
                              <div className="font-mono text-sm">{p.planId}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">价格</div>
                              <div className="font-semibold">{p.price || "-"} credits</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            购买时间：{new Date(p.createdAt).toLocaleString()}
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={refreshing}
                            onClick={() => toggleDetails(p.planId, p.option)}
                          >
                            {refreshing && isExpanded ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : isExpanded ? (
                              <ChevronUp className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            )}
                            {isExpanded ? "收起详情" : "查看详情"}
                          </Button>

                          {isExpanded && (
                            <>
                              {info && "error" in info && (
                                <div className="text-red-500 text-sm mt-3">
                                  获取失败：{info.error}
                                </div>
                              )}

                              {info && "data" in info && (
                                <div className="mt-4 text-sm space-y-1">
                                  {info.option === "residential" && (
                                    <>
                                      <div>用户名：{info.data.user}</div>
                                      <div>密码：{info.data.pass}</div>
                                      <div>总流量：{info.data.bandwidth} GB</div>
                                      <div>剩余流量：{info.data.bandwidthLeft} GB</div>
                                    </>
                                  )}

                                  {info.option === "mobile" && (
                                    <>
                                      <div>用户名：{info.data.user}</div>
                                      <div>密码：{info.data.pass}</div>
                                      <div>总流量：{info.data.bandwidth} GB</div>
                                      <div>剩余流量：{info.data.bandwidthLeft} GB</div>
                                    </>
                                  )}

                                  {info.option === "ipv6" && (
                                    <>
                                      <div>用户名：{info.data.proxies.username}</div>
                                      <div>密码：{info.data.proxies.password}</div>
                                      <div>
                                        地区数量：
                                        {Object.keys(info.data.whitelist_proxies || {}).length}
                                      </div>

                                      {/* IPv6 白名单管理 */}
                                      <div className="mt-4 space-y-2 border-t pt-3">
                                        <div className="text-sm font-medium">白名单 IP 管理</div>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            placeholder="输入 IP，例如 1.1.1.1 或 2001:db8::1"
                                            value={wlIpByPlan[p.planId] || ""}
                                            onChange={(e) =>
                                              setWlIpByPlan((prev) => ({
                                                ...prev,
                                                [p.planId]: e.target.value,
                                              }))
                                            }
                                          />
                                          <Button
                                            size="sm"
                                            disabled={
                                              wlBusyPlan === p.planId || !wlIpByPlan[p.planId]
                                            }
                                            onClick={() =>
                                              handleIPv6Whitelist(
                                                p.planId,
                                                wlIpByPlan[p.planId],
                                                "add"
                                              )
                                            }
                                          >
                                            添加
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={
                                              wlBusyPlan === p.planId || !wlIpByPlan[p.planId]
                                            }
                                            onClick={() =>
                                              handleIPv6Whitelist(
                                                p.planId,
                                                wlIpByPlan[p.planId],
                                                "remove"
                                              )
                                            }
                                          >
                                            移除
                                          </Button>
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {info.option === "isp" && (
                                    <>
                                      <div>代理数量：{info.data.proxies.length}</div>
                                      <div className="text-xs text-muted-foreground">示例：</div>
                                      <ul className="text-xs font-mono list-disc pl-4">
                                        {info.data.proxies.slice(0, 3).map((x, i) => (
                                          <li key={i}>{x}</li>
                                        ))}
                                      </ul>
                                    </>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </Card>
                      );
                    })}
                  </TabsContent>
                )
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
