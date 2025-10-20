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

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  credit: number;
  pool?: number;  
};

const API_BASE = "http://localhost:8210/api/auth";

export async function login(identifier: string, password: string): Promise<SessionUser> {
  const response = await axios.post(
    `${API_BASE}/login`,
    { identifier, password },
    { headers: { "Content-Type": "application/json" } }
  );
  const { token } = response.data;

  sessionStorage.setItem("token", token);

  const decoded: UserToken = jwtDecode(token);
  const { id, username, email, role } = decoded;

  let user: SessionUser = { id, username, email, role, credit: 0 };
  sessionStorage.setItem("user", JSON.stringify(user));

  const info = await axios.get(`http://localhost:8210/api/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const eff = Number(info.data?.user?.effectiveCredit ?? 0);

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
