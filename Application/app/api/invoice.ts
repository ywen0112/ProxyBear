import axios from "axios";

const API_BASE = "http://localhost:8210/api";

function authHeaders() {
  const raw = sessionStorage.getItem("token");
  const token = raw ? raw.trim().replace(/^"+|"+$/g, "") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type TxItem = {
  _id: string;
  type: "recharge" | "purchase" | "refund" | string;
  amount: number;                // USD
  expectedCredits?: number;      // 可选
  status: "pending" | "completed" | "expired" | "failed";
  orderId: string;
  paymentUrl?: string;
  expiresAt?: string;
  createdAt: string;
};

export type TxListResp = {
  items: TxItem[];
  total: number;
  page: number;
  pages: number;
};

export async function getMyTransactions(params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) {
  const res = await axios.get<TxListResp>(`${API_BASE}/transactions/my`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
}
