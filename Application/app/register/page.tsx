"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { register } from "../api/auth"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("密码和确认密码不匹配")
      return
    }

    register(username, email, password)
      .then(() => {
        router.push("/dashboard") 
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || "网络错误，请检查您的连接"
        setError(errorMessage) 
      })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            创建您的主账户
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            注册成为主用户，填写以下信息以获得完整的账户管理权限。
          </p>
          <div
            className={cn(
              error ? "block" : "hidden",
              "text-sm text-red-500 text-center mb-4"
            )}
          >
            {error}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm mb-2">
                  用户名
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent"
                  placeholder="请输入用户名"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-2">
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm mb-2">
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent"
                  placeholder="请输入密码"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm mb-2">
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-accent"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="text-lg px-8 py-3">
                注册
              </Button>
            </div>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              已有账户？{" "}
              <Link href="/login" className="text-accent hover:underline">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
