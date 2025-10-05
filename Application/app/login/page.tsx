"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "../api/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    login(email, password)
      .then(() => {
        router.push("/dashboard")  
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || "登录失败，请稍后重试"
        setError(errorMessage) 
      })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            登录您的账户
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            输入您的用户名或邮箱和密码以访问个人中心。
          </p>
          {error && (
            <div className="mb-6 text-center text-sm text-red-500">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                用户名或邮箱
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="请输入用户名或邮箱"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="请输入密码"
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-accent"
              >
                忘记密码？
              </Link>
              <Button type="submit" className="text-lg px-8 py-3">
                登录
              </Button>
            </div>
          </form>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              还没有账户？{" "}
              <Link href="/register" className="text-accent hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
