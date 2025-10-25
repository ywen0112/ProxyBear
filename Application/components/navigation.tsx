"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { LogOut } from "lucide-react";

type Role = "main" | "sub" | "admin" | string;

export function Navigation() {
  const router = useRouter();
  const pathnameRaw = usePathname();
  const [pathname, setPathname] = useState<string>("");
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [checkedUser, setCheckedUser] = useState(false);

  // ✅ 规范化 pathname
  useEffect(() => {
    if (pathnameRaw) {
      let p = pathnameRaw;
      if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
      setPathname(p);
    }
  }, [pathnameRaw]);

  // ✅ 从 sessionStorage 加载用户信息
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUsername(parsed?.username ?? null);
        setRole(parsed?.role ?? null);
      } catch (err) {
        console.error("Failed to parse user from sessionStorage", err);
      }
    } else {
      setUsername(null);
      setRole(null);
    }
    setCheckedUser(true);
  }, []);

  // ✅ 限制 sub user 访问某些页面
  const restrictedForSub = useMemo(() => ["/topup", "/subUser"], []);
  useEffect(() => {
    if (role === "sub" && pathname) {
      const hit = restrictedForSub.some(
        (base) => pathname === base || pathname.startsWith(base + "/")
      );
      if (hit) router.replace("/dashboard");
    }
  }, [role, pathname, restrictedForSub, router]);

  // ✅ 自动跳转 admin 至 /usersDataGrid
  useEffect(() => {
    if (!checkedUser) return; // 确保用户已加载
    const publicPages = ["/", "/login", "/register"];
    if (!role || publicPages.includes(pathname)) return;

    if (role === "admin" && !pathname.startsWith("/usersDataGrid")) {
      router.replace("/usersDataGrid");
    }
  }, [checkedUser, role, pathname, router]);

  // ✅ 登出
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUsername(null);
    setRole(null);
    router.push("/login");
  };

  // ✅ 当前路径高亮
  const isActive = (href: string) => {
    let h = href;
    if (h !== "/" && h.endsWith("/")) h = h.slice(0, -1);
    if (h === "/") return pathname === "/";
    return pathname === h || pathname.startsWith(h + "/");
  };

  // ✅ 不同角色的导航项
  const navItems = useMemo(() => {
    if (!role) return [];

    if (role === "admin") {
      // 管理员导航栏
      return [
        { href: "/usersDataGrid", label: "用户管理" },
        { href: "/usersPlans", label: "用户计划 / 订单" },
        { href: "/productsPricing", label: "产品价格配置" },
      ];
    }

    // 普通用户或子用户
    const items = [
      { href: "/dashboard", label: "控制台" },
      { href: "/products", label: "购买产品" },
      { href: "/invoice", label: "发票" },
      { href: "/purchased", label: "已购买产品" },
    ];

    if (role !== "sub") {
      items.splice(2, 0, { href: "/topup", label: "添加余额" });
      items.push({ href: "/subUser", label: "子用户" });
    }

    return items;
  }, [username, role]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={username ? (role === "admin" ? "/usersDataGrid" : "/dashboard") : "/"}
            className="text-2xl font-bold text-foreground hover:text-accent transition-colors"
          >
            Proxybear
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-foreground transition-colors",
                  isActive(item.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
          {role ? (
            <>
              <span className="text-sm text-muted-foreground">
                {role === "admin" ? "管理员" : username || "用户"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="退出登录"
              >
                <LogOut className="h-5 w-5 text-red-500" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
