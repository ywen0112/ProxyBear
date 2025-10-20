import axios from "axios";
import { jwtDecode } from "jwt-decode";

export type UserToken = {
  id: string;
  username: string;
  email: string;
  role: "main" | "sub" | "admin";
  credit: number; // 对 sub 通常为 0（共享池下正常）
  exp: number;
  iat: number;
};

// 用于 sessionStorage 的用户对象（允许可选 pool 字段，避免 TS 报错）
export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  credit: number; // 统一给旧页面使用
  pool?: number;  // 可选：主池余额（和 credit 同步写）
};

const API_BASE = "http://localhost:8210/api/auth";

export async function login(identifier: string, password: string): Promise<SessionUser> {
  const response = await axios.post(
    `${API_BASE}/login`,
    { identifier, password },
    { headers: { "Content-Type": "application/json" } }
  );
  const { token } = response.data;

  // 存 token
  sessionStorage.setItem("token", token);

  // 解 JWT（这里只拿基本身份信息；余额用二次拉取）
  const decoded: UserToken = jwtDecode(token);
  const { id, username, email, role } = decoded;

  // 先写一份初始对象（credit 先 0）
  let user: SessionUser = { id, username, email, role, credit: 0 };
  sessionStorage.setItem("user", JSON.stringify(user));

  // 二次拉取用户详情，拿有效余额（effectiveCredit）
  const info = await axios.get(`http://localhost:8210/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const eff = Number(info.data?.user?.effectiveCredit ?? 0);

  // 同步会话里的余额（写 credit + pool）
  user = { ...user, credit: eff, pool: eff };
  sessionStorage.setItem("user", JSON.stringify(user));

  return user;
}

export async function register(username: string, email: string, password: string): Promise<SessionUser> {
  const response = await axios.post(
    `${API_BASE}/register`,
    { username, email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  const { token } = response.data;

  sessionStorage.setItem("token", token);

  const decoded: UserToken = jwtDecode(token);
  const { id, username: decodedUsername, email: userEmail, role } = decoded;

  let user: SessionUser = { id, username: decodedUsername, email: userEmail, role, credit: 0 };
  sessionStorage.setItem("user", JSON.stringify(user));

  const info = await axios.get(`http://localhost:8210/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const eff = Number(info.data?.user?.effectiveCredit ?? 0);

  user = { ...user, credit: eff, pool: eff };
  sessionStorage.setItem("user", JSON.stringify(user));

  return user;
}
