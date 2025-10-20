"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Pencil } from "lucide-react"
import {
  getUserInfo,
  updateBasicInfo,
  updatePassword,
  upsertBillingInfo,
} from "../api/user"

export default function ProfilePage() {
  const [userId, setUserId] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [companyMode, setCompanyMode] = useState(false)

  const [editBasic, setEditBasic] = useState(false)
  const [editPassword, setEditPassword] = useState(false)
  const [editBilling, setEditBilling] = useState(false)

  const [tempUsername, setTempUsername] = useState("")
  const [tempEmail, setTempEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [billingInfo, setBillingInfo] = useState({
    legalName: "",
    legalSurname: "",
    billingEmail: "",
    phone: "",
    address: "",
    zip: "",
    companyName: "",
    vatNumber: "",
  })
  const [initialBillingInfo, setInitialBillingInfo] = useState({
    legalName: "",
    legalSurname: "",
    billingEmail: "",
    phone: "",
    address: "",
    zip: "",
    companyName: "",
    vatNumber: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [basicInfoError, setBasicInfoError] = useState({ username: "", email: "" })
  const [passwordError, setPasswordError] = useState("")

  // 统一更新 sessionStorage.user（只改 username / email，保留其他字段，比如 credit/pool/role）
  function updateSessionUser(partial: Partial<{ username: string; email: string }>) {
    const raw = sessionStorage.getItem("user")
    if (!raw) return
    try {
      const u = JSON.parse(raw)
      const next = { ...u, ...partial }
      sessionStorage.setItem("user", JSON.stringify(next))
      // 可选：广播资料变更事件（Navigation 如需监听可用）
      window.dispatchEvent(new CustomEvent("user:profile-updated", { detail: partial }))
    } catch {}
  }

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (!userData) return

    try {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.id) return
      setUserId(parsedUser.id)

      getUserInfo(parsedUser.id).then((res) => {
        setUsername(res.user.username)
        setEmail(res.user.email)
        setBillingInfo(res.billing || {})
        setInitialBillingInfo(res.billing || {})
        setCompanyMode(!!res.billing?.companyName)
      })
    } catch (err) {
      console.error("Failed to parse user from sessionStorage", err)
    }
  }, [])

  const handleCompanyModeChange = (checked: boolean) => {
    setCompanyMode(checked)
    if (!checked) {
      setBillingInfo({
        ...billingInfo,
        companyName: "",
        vatNumber: "",
      })
    }
  }

  const handleSaveBasic = async () => {
    if (!tempUsername) {
      setBasicInfoError((prev) => ({ ...prev, username: "用户名是必填的" }))
      return
    }
    if (!tempEmail) {
      setBasicInfoError((prev) => ({ ...prev, email: "电子邮件是必填的" }))
      return
    }

    try {
      const res = await updateBasicInfo(tempUsername, tempEmail)
      // 本页 state
      setUsername(res.user.username)
      setEmail(res.user.email)
      setEditBasic(false)
      setBasicInfoError({ username: "", email: "" })

      // ✅ 同步 sessionStorage.user，避免全站显示旧用户名/邮箱
      updateSessionUser({ username: res.user.username, email: res.user.email })
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message)
    }
  }

  const handleCancelBasic = () => {
    setTempUsername(username)
    setTempEmail(email)
    setEditBasic(false)
    setBasicInfoError({ username: "", email: "" })
  }

  const handleSavePassword = async () => {
    if (!currentPassword) {
      setPasswordError("当前密码不能为空")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("新密码与确认密码不匹配")
      return
    }
    try {
      await updatePassword(currentPassword, newPassword)
      setEditPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordError("")
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message)
    }
  }

  const handleCancelPassword = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setEditPassword(false)
    setPasswordError("")
  }

  const handleSaveBilling = async () => {
    try {
      const res = await upsertBillingInfo({ ...billingInfo, companyMode })
      setBillingInfo(res.billing)
      setInitialBillingInfo(res.billing)
      setCompanyMode(!!res.billing?.companyName)
      setEditBilling(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message)
    }
  }

  const handleCancelBilling = () => {
    setBillingInfo({ ...initialBillingInfo })
    setEditBilling(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="px-6 py-10 max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">账户设置</h1>
        <p className="text-sm text-muted-foreground">您的个人资料详情</p>
        {error && <div className="text-red-500 text-center">{error}</div>}

        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                  <CardTitle className="text-lg font-semibold">基本信息</CardTitle>
                  {!editBasic && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setTempUsername(username)
                        setTempEmail(email)
                        setEditBasic(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {editBasic ? (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">用户 ID</Label>
                      <Input value={userId} readOnly disabled />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">用户名</Label>
                      <Input value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
                      {basicInfoError.username && (
                        <p className="text-xs text-red-500">{basicInfoError.username}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">电子邮件</Label>
                      <Input value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} />
                      {basicInfoError.email && (
                        <p className="text-xs text-red-500">{basicInfoError.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button onClick={handleSaveBasic}>保存</Button>
                      <Button variant="outline" onClick={handleCancelBasic}>
                        取消
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">用户 ID</Label>
                      <p className="mt-1 text-base font-medium text-foreground">{userId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">用户名</Label>
                      <p className="mt-1 text-base font-medium text-foreground">{username}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">电子邮件</Label>
                      <p className="mt-1 text-base font-medium text-foreground">{email}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 密码 */}
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                  <CardTitle className="text-lg font-semibold">密码</CardTitle>
                  {!editPassword && (
                    <Button size="icon" variant="ghost" onClick={() => setEditPassword(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {editPassword ? (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">当前密码</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">新密码</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">确认密码</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button onClick={handleSavePassword}>保存</Button>
                      <Button variant="outline" onClick={handleCancelPassword}>
                        取消
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-base font-medium text-foreground">***************</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 账单信息 */}
          <div className="md:col-span-8">
            <Card className="h-full">
              <CardHeader>
                <div className="flex flex-row items-center justify-between w-full">
                  <CardTitle className="text-lg font-semibold">账单信息</CardTitle>
                  {!editBilling && (
                    <Button size="icon" variant="ghost" onClick={() => setEditBilling(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {editBilling ? (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">名字</Label>
                      <Input
                        value={billingInfo.legalName || ""}
                        onChange={(e) => setBillingInfo({ ...billingInfo, legalName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">姓氏</Label>
                      <Input
                        value={billingInfo.legalSurname || ""}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, legalSurname: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">账单邮箱</Label>
                      <Input
                        value={billingInfo.billingEmail || ""}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, billingEmail: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">电话号码</Label>
                      <Input
                        value={billingInfo.phone || ""}
                        onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">账单地址</Label>
                      <Input
                        value={billingInfo.address || ""}
                        onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-normal">邮编</Label>
                      <Input
                        value={billingInfo.zip || ""}
                        onChange={(e) => setBillingInfo({ ...billingInfo, zip: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center gap-2 md:col-span-2">
                      <Label className="text-xs text-muted-foreground font-normal">公司模式</Label>
                      <Switch checked={companyMode} onCheckedChange={handleCompanyModeChange} />
                    </div>

                    {companyMode && (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground font-normal">公司名称</Label>
                          <Input
                            value={billingInfo.companyName || ""}
                            onChange={(e) =>
                              setBillingInfo({ ...billingInfo, companyName: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground font-normal">VAT 编号</Label>
                          <Input
                            value={billingInfo.vatNumber || ""}
                            onChange={(e) =>
                              setBillingInfo({ ...billingInfo, vatNumber: e.target.value })
                            }
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-2 justify-end md:col-span-2">
                      <Button onClick={handleSaveBilling}>保存</Button>
                      <Button variant="outline" onClick={handleCancelBilling}>
                        取消
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      ["名字", billingInfo.legalName],
                      ["姓氏", billingInfo.legalSurname],
                      ["账单邮箱", billingInfo.billingEmail],
                      ["电话号码", billingInfo.phone],
                      ["账单地址", billingInfo.address],
                      ["邮编", billingInfo.zip],
                      ["公司模式", companyMode ? "是" : "否"],
                      ...(companyMode
                        ? [
                            ["公司名称", billingInfo.companyName],
                            ["VAT 编号", billingInfo.vatNumber],
                          ]
                        : []),
                    ].map(([label, value], i) => (
                      <div key={i}>
                        <Label className="text-xs text-muted-foreground font-normal">{label}</Label>
                        <p className="mt-1 text-base font-medium text-foreground">
                          {value && value !== "" ? (value as string) : "-"}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
