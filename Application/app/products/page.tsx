"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Check } from "lucide-react";
import { getAllProducts, getProductQuote, Product } from "../api/product";
import { createPurchasePlan } from "../api/purchase";
import { spend } from "../api/user";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubByCat, setActiveSubByCat] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [price, setPrice] = useState<number | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getAllProducts();
        setProducts(list);

        if (list.length > 0) {
          setActiveCategory(list[0].category);
        }

        // 为每个分类设定默认子类型
        const initSubs: Record<string, string> = {};
        for (const p of list) {
          const preferred = p.subCategories?.find(s => s.name === "Bandwidth") || p.subCategories?.[0];
          if (preferred) initSubs[p.category] = preferred.name;
        }
        setActiveSubByCat(initSubs);
      } catch (e: any) {
        setError(e?.response?.data?.message || "加载产品失败");
        console.error("加载产品失败", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setPrice(null);
  };

  const handleGetQuote = async (category: string) => {
    try {
      const res = await getProductQuote(category, formData);
      setPrice(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.message || "报价计算失败")
      // alert(err.message || "报价计算失败");
    }
  };

  const handlePurchase = async (category: string, data: Record<string, any>) => {
    try {
      setError(null);
      setSuccess(null);

      if (price == null || Number(price) <= 0) {
        setError("请先获取报价");
        return;
      }

      // --- ① 检查登录和余额 ---
      const rawUser = sessionStorage.getItem("user");
      if (!rawUser) {
        setError("请先登录");
        return;
      }
      const user = JSON.parse(rawUser);
      const currentCredit = Number(user?.credit || user?.pool || 0);

      if (currentCredit < Number(price)) {
        setError(`余额不足，当前余额为 ${currentCredit} credits`);
        return;
      }

      setPurchaseLoading(true);

      // --- ② 扣款 ---
      const spendRes = await spend(Number(price));
      const newPool = spendRes?.main?.pool;
      if (typeof newPool === "number") {
        const updated = { ...user, credit: newPool, pool: newPool };
        sessionStorage.setItem("user", JSON.stringify(updated));
      }

      // --- ③ 创建计划 ---
      const res = await createPurchasePlan(category.toLowerCase() as any, {
        ...data,
        price,
      });

      if (res?.planID) {
        setSuccess(`✅ 购买成功！Plan ID: ${res.planID}`);
      } else {
        setError("购买成功但未返回 Plan ID");
      }

      // --- ④ 更新余额信息 ---
      try {
        const token = sessionStorage.getItem("token");
        const resUser = await fetch(`http://localhost:8210/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const info = await resUser.json();
        const eff = Number(info.user?.effectiveCredit ?? 0);
        const updated = { ...user, credit: eff, pool: eff };
        sessionStorage.setItem("user", JSON.stringify(updated));
      } catch (e) {
        console.warn("余额刷新失败", e);
      }

    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "购买失败：未知错误";
      setError(msg);
    } finally {
      setPurchaseLoading(false);
    }
  };


  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <Tabs
          value={activeCategory}
          onValueChange={(v) => {
            setActiveCategory(v);
            setPrice(null);
            setFormData({});
          }}
          className="w-full"
        >

          {/* 顶层：产品类别切换 */}
          <TabsList className="flex flex-wrap justify-center mb-10 gap-2">
            {products.map((p) => (
              <TabsTrigger key={p._id} value={p.category}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {error && <div className="text-start text-sm text-red-500">{error}</div>}
          {success && <div className="text-start text-sm text-green-600">{success}</div>}

          {products.map((p) => {
            const activeSub = activeSubByCat[p.category];
            const subs = p.subCategories || [];
            const currentSub = subs.find((s) => s.name === activeSub) || subs[0];

            return (
              <TabsContent key={p._id} value={p.category}>
                {/* 产品描述 */}
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-2">{p.description.short}</h2>
                  <p className="text-sm text-gray-600 mb-3">{p.description.long}</p>
                  <p className="text-sm text-gray-600 mb-3">{p.description.long2}</p>
                  <ul className="text-sm text-gray-700 mb-2 space-y-1">
                    {p.description.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* 二级：同分类下的子类型切换（如 IPv6 的 Bandwidth / Unlimited） */}
                {subs.length > 1 && (
                  <Tabs
                    value={activeSub || subs[0]?.name}
                    onValueChange={(name) => {
                      setActiveSubByCat((prev) => ({ ...prev, [p.category]: name }));
                      setPrice(null);
                      setFormData({});
                    }}
                    className="w-full"
                  >
                    <TabsList className="mb-4">
                      {subs.map((s) => (
                        <TabsTrigger key={s.name} value={s.name}>
                          {s.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {subs.map((s) => (
                      <TabsContent key={s.name} value={s.name}>
                        <Card className="p-6 mb-6">
                          <h3 className="text-lg font-semibold mb-4">{s.name}</h3>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleGetQuote(p.category);
                            }}
                            className="space-y-4"
                          >
                            {s.formFields.map((field) => (
                              <div key={field.key}>
                                <Label className="text-sm font-medium mb-1">{field.label}</Label>
                                {field.type === "integer" ? (
                                  <Input
                                    type="number"
                                    min={field.min || 1}
                                    step={field.step || 1}
                                    placeholder={field.help || ""}
                                    value={formData[field.key] || ""}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                  />
                                ) : field.type === "select" ? (
                                  <Select
                                    onValueChange={(val) => handleInputChange(field.key, val)}
                                    value={formData[field.key] || ""}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`请选择 ${field.label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.enum?.map((opt: any) => (
                                        <SelectItem key={opt.value} value={String(opt.value)}>
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : null}
                              </div>
                            ))}

                            <div className="pt-4 flex flex-col items-center gap-3">
                              <Button type="submit" className="w-full sm:w-48">
                                获取报价
                              </Button>

                              {price !== null && (
                                <p className="text-lg font-semibold text-primary">
                                  预计价格: ${Number(price).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </form>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                )}

                {/* 只有一个子类型时，直接渲染它 */}
                {subs.length === 1 && currentSub && (
                  <Card className="p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">{currentSub.name}</h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGetQuote(p.category);
                      }}
                      className="space-y-4"
                    >
                      {currentSub.formFields.map((field) => (
                        <div key={field.key}>
                          <Label className="text-sm font-medium mb-1">{field.label}</Label>
                          {field.type === "integer" ? (
                            <Input
                              type="number"
                              min={field.min || 1}
                              step={field.step || 1}
                              placeholder={field.help || ""}
                              value={formData[field.key] || ""}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                            />
                          ) : field.type === "select" ? (
                            <Select
                              onValueChange={(val) => handleInputChange(field.key, val)}
                              value={formData[field.key] || ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`请选择 ${field.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.enum?.map((opt: any) => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}
                        </div>
                      ))}

                      <div className="pt-4 flex flex-col items-center gap-3">
                        <Button type="submit" className="w-full sm:w-48">
                          获取报价
                        </Button>

                        {price !== null && (
                          <>
                            <p className="text-lg font-semibold text-primary">
                              预计价格: ${Number(price).toFixed(2)}
                            </p>
                            <Button
                              variant="outline"
                              className="w-full sm:w-48"
                              disabled={purchaseLoading}
                              onClick={() => handlePurchase(p.category, formData)}
                            >
                              {purchaseLoading ? "处理中..." : "立即购买"}
                            </Button>
                          </>
                        )}
                      </div>
                    </form>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
