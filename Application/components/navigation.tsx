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

  useEffect(() => {
    if (pathnameRaw) {
      let p = pathnameRaw;
      if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
      setPathname(p);
    }
  }, [pathnameRaw]);

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
  }, []);

  const restrictedForSub = useMemo(() => ["/topup", "/subUser"], []);
  useEffect(() => {
    if (role === "sub" && pathname) {
      const hit = restrictedForSub.some(
        (base) => pathname === base || pathname.startsWith(base + "/")
      );
      if (hit) router.replace("/dashboard");
    }
  }, [role, pathname, restrictedForSub, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUsername(null);
    setRole(null);
    router.push("/login");
  };

  const isActive = (href: string) => {
    let h = href;
    if (h !== "/" && h.endsWith("/")) h = h.slice(0, -1);
    if (h === "/") return pathname === "/";
    return pathname === h || pathname.startsWith(h + "/");
  };

  const navItems = useMemo(() => {
    if (!username) return [];
    const items = [
      { href: "/dashboard", label: "控制台" },
      { href: "/products", label: "购买产品" },
      { href: "/invoice", label: "发票" },
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
            href={username ? "/dashboard" : "/"}
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
            {username ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {username}
                </Link>
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
