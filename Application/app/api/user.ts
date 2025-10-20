import axios from "axios";

const API_BASE = "http://localhost:8210/api";

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
    credit?: number;        
    usesPool?: boolean;    
    effectiveCredit: number; 
    parent?: string;
  };
  billing: Record<string, any> | null;
};

export type CreatedSubUser = {
  id: string;
  email: string;
  username: string;
  password: string; 
  usesPool: true;
  credit: 0;
};

export type SubUserListItem = {
  id: string;
  email: string;
  username: string;
  usesPool: boolean;        
  credit?: number;         
  effectiveCredit: number;  
  createdAt?: string;
};

export type RemoveSubUserResponse = {
  message: string;
  subuser: { id: string; email: string; username: string; credit: number };
};


export async function getUserInfo(userId: string): Promise<UserInfo> {
  const res = await axios.get(`${API_BASE}/users/${userId}`, { headers: authHeaders() });
  return res.data as UserInfo;
}

export async function updateBasicInfo(username: string, email: string) {
  const res = await axios.patch(
    `${API_BASE}/users/me`,
    { username, email },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const res = await axios.post(
    `${API_BASE}/users/me/password`,
    { currentPassword, newPassword },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}

export async function upsertBillingInfo(billingData: Record<string, any>) {
  const res = await axios.post(`${API_BASE}/users/me/billing`, billingData, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return res.data;
}

export async function addSubUser(email: string): Promise<CreatedSubUser> {
  const res = await axios.post(
    `${API_BASE}/users/me/subusers`,
    { email },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data as CreatedSubUser;
}

export async function fetchSubUserList(email?: string): Promise<SubUserListItem[]> {
  const res = await axios.get(`${API_BASE}/users/me/subusers`, {
    headers: authHeaders(),
    params: email ? { email } : {},
  });
  return res.data.subusers as SubUserListItem[];
}

export async function removeSubUser(subId: string): Promise<RemoveSubUserResponse> {
  const res = await axios.delete(`${API_BASE}/users/me/subusers/${subId}`, {
    headers: authHeaders(),
  });
  return res.data as RemoveSubUserResponse;
}

export async function spend(amount: number, userId?: string) {
  const res = await axios.post(
    `${API_BASE}/users/spend`,
    userId ? { amount, userId } : { amount },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
}
