import apiClient from "./client";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}