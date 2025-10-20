import axios from "axios";

const API_BASE = "http://localhost:8210/api";

// 统一加 token
function authHeaders() {
  const token = sessionStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export type UserInfo = {
  user: {
    _id: string;
    role: "main" | "sub";
    email: string;
    username: string;
    credit?: number;        // main=公共池
    usesPool?: boolean;     // sub 才有意义（共享池下恒为 true）
    effectiveCredit: number; // 展示余额：sub=主池余额
    parent?: string;
  };
  billing: Record<string, any> | null;
};

export type CreatedSubUser = {
  id: string;
  email: string;
  username: string;
  password: string; // 仅创建时返回
  usesPool: true;
  credit: 0;
};

export type SubUserListItem = {
  id: string;
  email: string;
  username: string;
  usesPool: boolean;        // 共享池下恒为 true
  credit?: number;          // 共享池下无意义（不使用）
  effectiveCredit: number;  // 展示余额（= 主池）
  createdAt?: string;
};

export type RemoveSubUserResponse = {
  message: string;
  subuser: { id: string; email: string; username: string; credit: number };
};


// 读取用户（保留原样：GET /users/:id）
export async function getUserInfo(userId: string): Promise<UserInfo> {
  const res = await axios.get(`${API_BASE}/users/${userId}`, { headers: authHeaders() });
  return res.data as UserInfo;
}

// 更新基本资料：PATCH /users/me
export async function updateBasicInfo(username: string, email: string) {
  const res = await axios.patch(
    `${API_BASE}/users/me`,
    { username, email },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

// 更新密码：POST /users/me/password
export async function updatePassword(currentPassword: string, newPassword: string) {
  const res = await axios.post(
    `${API_BASE}/users/me/password`,
    { currentPassword, newPassword },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

// 账单 upsert：POST /users/me/billing
export async function upsertBillingInfo(billingData: Record<string, any>) {
  const res = await axios.post(`${API_BASE}/users/me/billing`, billingData, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

// 创建子用户：POST /users/me/subusers
export async function addSubUser(email: string): Promise<CreatedSubUser> {
  const res = await axios.post(
    `${API_BASE}/users/me/subusers`,
    { email },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data as CreatedSubUser;
}

// 子用户列表：GET /users/me/subusers?email=
export async function fetchSubUserList(email?: string): Promise<SubUserListItem[]> {
  const res = await axios.get(`${API_BASE}/users/me/subusers`, {
    headers: authHeaders(),
    params: email ? { email } : {},
  });
  return res.data.subusers as SubUserListItem[];
}

// 删除子用户：DELETE /users/me/subusers/:subId
export async function removeSubUser(subId: string): Promise<RemoveSubUserResponse> {
  const res = await axios.delete(`${API_BASE}/users/me/subusers/${subId}`, {
    headers: authHeaders(),
  });
  return res.data as RemoveSubUserResponse;
}

// 统一消费（主/子）：POST /users/spend
// 返回值形状由后端直接返回（包含 main.pool、以及 sub 的有效余额信息）
export async function spend(amount: number, userId?: string) {
  const res = await axios.post(
    `${API_BASE}/users/spend`,
    userId ? { amount, userId } : { amount },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}
