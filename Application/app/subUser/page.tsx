"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, PlusCircle, Trash2 } from "lucide-react"

interface SubUser {
  id: string
  clientName: string
  username: string
  password: string
  assignedGB: number
}

// 随机字符串生成器
function generateRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function SubUserPage() {
  const [subUsers, setSubUsers] = useState<SubUser[]>([])
  const [clientName, setClientName] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [amount, setAmount] = useState("")

  const handleAddSubUser = () => {
    if (!clientName.trim()) return

    const username = generateRandomString(10)
    const password = generateRandomString(10)

    const newSubUser: SubUser = {
      id: Date.now().toString(),
      clientName,
      username,
      password,
      assignedGB: 0,
    }

    setSubUsers([...subUsers, newSubUser])
    setClientName("")
  }

  const handleRemoveSubUser = (id: string) => {
    setSubUsers(subUsers.filter((user) => user.id !== id))
    if (selectedUserId === id) setSelectedUserId(null)
  }

  const handleAssignGB = () => {
    if (!selectedUserId || !amount) return
    setSubUsers(
      subUsers.map((user) =>
        user.id === selectedUserId
          ? { ...user, assignedGB: user.assignedGB + parseFloat(amount) }
          : user
      )
    )
    setAmount("")
  }

  const handleRemoveGB = () => {
    if (!selectedUserId || !amount) return
    setSubUsers(
      subUsers.map((user) =>
        user.id === selectedUserId
          ? {
              ...user,
              assignedGB: Math.max(
                0,
                user.assignedGB - parseFloat(amount)
              ),
            }
          : user
      )
    )
    setAmount("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold">子用户管理</h1>
            <p className="text-muted-foreground">
              输入客户姓名，系统会生成代理用户和密码，并可分配流量
            </p>
          </div>

          {/* 添加子用户 */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="输入客户姓名"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAddSubUser} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              添加子用户
            </Button>
          </div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">子用户列表</TabsTrigger>
              <TabsTrigger value="manage" disabled={!selectedUserId}>
                管理用户
              </TabsTrigger>
            </TabsList>

            {/* 子用户列表 */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    已添加的子用户
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
                            selectedUserId === user.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">客户姓名: {user.clientName}</div>
                              <div className="text-sm">代理用户: {user.username}</div>
                              <div className="text-sm">代理密码: {user.password}</div>
                              <div className="text-sm text-green-600">
                                已分配流量: {user.assignedGB} GB
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveSubUser(user.id)
                              }}
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

            {/* 管理用户 */}
            <TabsContent value="manage">
              {selectedUserId && (
                <Card>
                  <CardHeader>
                    <CardTitle>管理子用户流量</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="number"
                      placeholder="输入要分配/移除的GB数"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="max-w-xs"
                    />
                    <div className="flex gap-3">
                      <Button onClick={handleAssignGB}>分配GB</Button>
                      <Button variant="destructive" onClick={handleRemoveGB}>
                        移除GB
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
