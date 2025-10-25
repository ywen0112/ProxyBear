import axios from "axios";

const API_BASE = "http://localhost:8210/api/purchase";

function authHeaders() {
  const raw = sessionStorage.getItem("token");
  const token = raw ? raw.trim().replace(/^"+|"+$/g, "") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type PlanIdResponse = { planID: string };

export type ReadResidentialResponse = {
  id: string;
  duration: number;
  bandwidth: number;
  bandwidthLeft: number;
  user: string;
  pass: string;
};

export type ReadMobileResponse = ReadResidentialResponse;

export type ReadIPv6Response = {
  proxies: { username: string; password: string };
  whitelist_proxies: Record<string, string[]>; // e.g. { us: ["host:port"], gb: [...] }
};

export type ReadDatacenterResponse = { proxies: string[] };
export type ReadISPResponse = { proxies: string[] };

// ------------------------------------------------------
// 🔹 创建购买计划
// ------------------------------------------------------
export async function createPlan(
  option: "residential" | "mobile" | "ipv6" | "isp",
  payload: Record<string, any>
): Promise<PlanIdResponse> {
  const res = await axios.post(`${API_BASE}/getplan/${option}`, payload, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

// ------------------------------------------------------
// 🔹 读取计划详情
// ------------------------------------------------------
export async function readResidential(planId: string): Promise<ReadResidentialResponse> {
  const res = await axios.get(`${API_BASE}/plan/residential/${encodeURIComponent(planId)}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function readMobile(planId: string): Promise<ReadMobileResponse> {
  const res = await axios.get(`${API_BASE}/plan/mobile/${encodeURIComponent(planId)}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function readIPv6(planId: string): Promise<ReadIPv6Response> {
  const res = await axios.get(`${API_BASE}/plan/ipv6/${encodeURIComponent(planId)}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function readDatacenter(planId: string): Promise<ReadDatacenterResponse> {
  const res = await axios.get(`${API_BASE}/plan/datacenter/${encodeURIComponent(planId)}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function readISP(planId: string): Promise<ReadISPResponse> {
  const res = await axios.get(`${API_BASE}/plan/isp/${encodeURIComponent(planId)}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function ipv6Whitelist(planId: string, ip: string, action: "add" | "remove") {
  const res = await axios.post(
    `${API_BASE}/purchase/plan/ipv6/whitelist`,
    { action, planId, ip },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data as { success: boolean; message: string };
}

export async function extendPlan(
  planId: string,
  type: "ipv6" | "isp",
  speedOrValue: string,
  duration?: number
) {
  const body =
    type === "ipv6"
      ? { planId, type, speed: speedOrValue, duration }
      : { planId, type, value: speedOrValue };

  const res = await axios.patch(
    `http://localhost:8210/api/purchase/plan/extend`,
    body,
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );

  return res.data;
}
