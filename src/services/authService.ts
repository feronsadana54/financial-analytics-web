import { getData, postData } from "./api";
import type { AuthUser, LoginPayload, LoginResponse, RegisterPayload } from "../types/auth";

export function login(payload: LoginPayload) {
  return postData<LoginResponse>("/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return postData<LoginResponse>("/auth/register", payload);
}

export function fetchMe() {
  return getData<AuthUser>("/auth/me");
}
