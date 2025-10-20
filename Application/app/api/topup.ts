import axios from "axios";
import { jwtDecode } from "jwt-decode";

/** ====== 统一类型 ====== */
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

/** ====== 和 user.ts 保持一致的基础地址 & 鉴权头 ====== */
const API_BASE = "http://localhost:8210/api";

// 和 user.ts 一样：没有 token 就不发 Authorization 头
function authHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** ====== 会话工具 ====== */
function getToken(): string | null {
  try {
    return sessionStorage.getItem("token");
  } catch {
    return null;
  }
}

function requireToken(): string {
  const t = getToken();
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

/** ====== API 返回类型 ====== */
export type TopupCreateResponse = {
  paymentUrl: string;
  orderId: string;
  rate: number;
  expectedCredits: number;
  transactionId?: string;
};

export type BalanceResponse = { credit: number };

/** ====== 1) 发起充值：POST /credits/recharge ====== */
export async function startTopup(
  amount: number,
  options?: { autoRedirect?: boolean; newTab?: boolean }
): Promise<TopupCreateResponse> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  const { autoRedirect = true, newTab = false } = options ?? {};
  const url = `${API_BASE}/credits/recharge`;

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
}

/** ====== 2) 查询余额：GET /credits/balance ====== */
export async function getBalance(): Promise<BalanceResponse> {
  const url = `${API_BASE}/credits/balance`;
  const res = await axios.get<BalanceResponse>(url, { headers: authHeaders() });
  return res.data;
}

/** ====== 3) 刷新会话里的余额（写回 sessionStorage.user） ====== */
export async function refreshSessionBalance(): Promise<number> {
  // 无 user 时用 token 兜底恢复
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
