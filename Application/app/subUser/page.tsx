"use client"

import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, PlusCircle, Trash2, RefreshCw, LinkIcon } from "lucide-react";
import {
  addSubUser,
  type CreatedSubUser,
  fetchSubUserList,
  type SubUserListItem,
  removeSubUser,
} from "../api/user";

export type SubUserRow = {
  id: string;
  email: string;
  username: string;
  password?: string;        // 仅创建时显示一次
  usesPool: boolean;        // 共享池下恒为 true
  credit?: number;          // 共享池下无意义
  effectiveCredit: number;  // 展示余额：主池余额
};

export default function SubUserPage() {
  const [subUsers, setSubUsers] = useState<SubUserRow[]>([]);
  const [email, setEmail] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oneTimePwMap, setOneTimePwMap] = useState<Record<string, string>>({});

  // 从 session 拿主池作为兜底（如果后端没返回 effectiveCredit）
  function getMainPoolFromSession(): number {
    try {
      const raw = sessionStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : {};
      return Number(u.pool ?? u.credit ?? 0) || 0;
    } catch {
      return 0;
    }
  }

  // 列表刷新（带一次性密码映射，避免竞态）
  const reloadList = async (pwMap: Record<string, string> = oneTimePwMap) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSubUserList();
      setSubUsers(
        list.map((u: SubUserListItem) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          usesPool: true,
          credit: 0,
          effectiveCredit: u.effectiveCredit ?? getMainPoolFromSession(),
          // 新建的一次性明文密码，仅在本地 map 显示一次
          password: pwMap[u.id] ?? undefined,
        }))
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "加载子用户失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadList();
  }, []);

  // ========== 事件处理 ==========
  const handleAddSubUser = async () => {
    if (!email.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const data: CreatedSubUser = await addSubUser(email.trim());
      setEmail("");
      // 存一次性密码 → 用这份 map 刷新列表（只显示一次明文）
      const nextPwMap = { ...oneTimePwMap, [data.id]: data.password };
      setOneTimePwMap(nextPwMap);
      await reloadList(nextPwMap);
      setSuccess(`创建成功：${data.email}（请妥善保存密码）`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "创建子用户失败");
    }
  };

  const handleRemoveSubUser = async (id: string) => {
    if (!id) return;
    if (!confirm("确认删除该子用户？此操作不可撤销")) return;
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await removeSubUser(id);
      setSubUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedId === id) setSelectedId(null);
      setSuccess("删除成功");
      // 共享池下删除不会影响主池余额，因此无需刷新 session 的 credit
    } catch (err: any) {
      setError(err?.response?.data?.message || "删除失败");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedUser = useMemo(
    () => subUsers.find((u) => u.id === selectedId) || null,
    [subUsers, selectedId]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">子用户管理</h1>
              <p className="text-muted-foreground">创建子用户（共享主池）</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await reloadList();
              }}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> 刷新
            </Button>
          </div>

          {/* 添加子用户 */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="输入子用户邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAddSubUser} className="flex items-center gap-2" disabled={loading}>
              <PlusCircle className="w-4 h-4" /> 添加子用户
            </Button>
          </div>

          {error && <div className="text-start text-sm text-red-500">{error}</div>}
          {success && <div className="text-start text-sm text-green-600">{success}</div>}

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">子用户列表</TabsTrigger>
            </TabsList>

            {/* 子用户列表 */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> 已添加的子用户
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subUsers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">暂无子用户</p>
                  ) : (
                    <div className="space-y-4">
                      {subUsers.map((user) => (
                        <div
                          key={user.id}
                          className={`border p-3 rounded-md cursor-pointer ${
                            selectedId === user.id ? "border-blue-500 bg-foreground text-black" : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedId(user.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <div className="font-medium">邮箱: {user.email}</div>
                              <div className="text-sm">用户名: {user.username}</div>
                              <div className="text-sm">初始密码: {user.password ?? "********（仅创建时显示明文）"}</div>
                              <div className="text-sm flex items-center gap-1">
                                <LinkIcon className="w-4 h-4" /> 使用公共池 · 有效余额: <b>{user.effectiveCredit}</b>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              disabled={deletingId === user.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSubUser(user.id);
                              }}
                              title={deletingId === user.id ? "正在删除..." : "删除"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
