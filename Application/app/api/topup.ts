import axios from "axios";
import { jwtDecode } from "jwt-decode";

export type UserToken = {
  id?: string;
  userId?: string;
  sub?: string;
  username: string;
  email: string;
  role: "main" | "sub" | "admin";
  credit?: number;
  exp: number;
  iat: number;
};

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  credit: number;
  pool?: number;
};

export type TopupCreateResponse = {
  paymentUrl: string;
  orderId: string;
  rate: number;
  expectedCredits: number;
  transactionId: string;
  expiresAt: string; // ISO
};

export type BalanceResponse = { credit: number };

export type ActivePaymentResponse =
  | { hasActive: false }
  | {
      hasActive: true;
      transactionId: string;
      orderId: string;
      paymentUrl: string;
      expiresAt: string; // ISO
    };

const API_BASE = "http://localhost:8210/api";

function authHeaders() {
  const raw = sessionStorage.getItem("token");
  const token = raw ? raw.trim().replace(/^"+|"+$/g, "") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireToken(): string {
  const raw = sessionStorage.getItem("token");
  const t = raw ? raw.trim().replace(/^"+|"+$/g, "") : null;
  if (!t) throw new Error("Not authenticated");
  return t;
}

function loadSessionUser(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function saveSessionUser(u: SessionUser) {
  sessionStorage.setItem("user", JSON.stringify(u));
}

function extractUserIdFromToken(t: string): string {
  const d = jwtDecode<UserToken>(t);
  const id = d.id || d.userId || d.sub;
  if (!id) throw new Error("Token missing user id");
  return id;
}

export async function startTopup(
  amount: number,
  options?: { autoRedirect?: boolean; newTab?: boolean }
): Promise<TopupCreateResponse> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  const { autoRedirect = true, newTab = false } = options ?? {};
  const url = `${API_BASE}/credits/recharge`;

  try {
    const res = await axios.post<TopupCreateResponse>(
      url,
      { amount },
      { headers: { "Content-Type": "application/json", ...authHeaders() } }
    );

    const data = res.data;
    if (autoRedirect && typeof window !== "undefined") {
      if (newTab) window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      else window.location.assign(data.paymentUrl);
    }
    return data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || "Failed to create topup";
    throw new Error(msg);
  }
}

/** ====== 1.1) 找回有效的未完成支付：GET /credits/active-payment ====== */
export async function getActivePayment(): Promise<ActivePaymentResponse> {
  const url = `${API_BASE}/credits/active-payment`;
  try {
    const res = await axios.get<ActivePaymentResponse>(url, { headers: authHeaders() });
    return res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || "Failed to fetch active payment";
    throw new Error(msg);
  }
}

/** ====== 1.2) 取消一笔待支付：POST /credits/expire/:transactionId ====== */
export async function expirePayment(transactionId: string): Promise<{ ok: boolean }> {
  const url = `${API_BASE}/credits/expire/${transactionId}`;
  try {
    const res = await axios.post(url, null, { headers: authHeaders() });
    return res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || "Failed to expire payment";
    throw new Error(msg);
  }
}

/** ====== 2) 查询余额：GET /credits/balance ====== */
export async function getBalance(): Promise<BalanceResponse> {
  const url = `${API_BASE}/credits/balance`;
  try {
    const res = await axios.get<BalanceResponse>(url, { headers: authHeaders() });
    return res.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message || "Failed to get balance";
    throw new Error(msg);
  }
}

/** ====== 3) 刷新会话里的余额（写回 sessionStorage.user） ====== */
export async function refreshSessionBalance(): Promise<number> {
  let me = loadSessionUser();
  if (!me) {
    const token = requireToken();
    const decoded = jwtDecode<UserToken>(token);
    const userId = extractUserIdFromToken(token);
    const seed: SessionUser = {
      id: userId,
      username: decoded.username ?? "",
      email: decoded.email ?? "",
      role: decoded.role ?? "main",
      credit: 0,
    };
    saveSessionUser(seed);
    me = seed;
  }

  const { credit } = await getBalance();
  const current = loadSessionUser();
  if (current) {
    const updated: SessionUser = { ...current, credit, pool: credit };
    saveSessionUser(updated);
  }
  return credit;
}

/** ====== 4) 获取当前会话用户 ====== */
export function getSessionUser(): SessionUser | null {
  return loadSessionUser();
}

/** ====== 5) 便捷函数：进入充值页时先尝试“找回或创建” ====== */
export async function ensureTopupOrResume(
  amount: number,
  options?: { preferResume?: boolean; autoRedirect?: boolean; newTab?: boolean }
): Promise<TopupCreateResponse | ActivePaymentResponse> {
  const { preferResume = true, autoRedirect = true, newTab = false } = options ?? {};

  if (preferResume) {
    const active = await getActivePayment();
    if (active.hasActive) {
      if (autoRedirect && typeof window !== "undefined") {
        if (newTab) window.open(active.paymentUrl, "_blank", "noopener,noreferrer");
        else window.location.assign(active.paymentUrl);
      }
      return active;
    }
  }
  return startTopup(amount, { autoRedirect, newTab });
}
