import { defineStore } from "pinia";
import { clearStoredToken, setStoredToken } from "../services/api";
import { fetchMe, login as loginRequest, register as registerRequest } from "../services/authService";
import type { AuthUser, LoginPayload, RegisterPayload, Role } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  error: string;
};

const ROLE_ORDER: Record<Role, number> = {
  USER: 1,
  MANAGER: 2,
  SUPER_ADMIN: 3
};

function meetsMinimum(role: Role | null, target: Role) {
  if (!role) return false;
  return ROLE_ORDER[role] >= ROLE_ORDER[target];
}

function matchesAny(role: Role | null, targets: Role[]) {
  if (!role) return false;
  return targets.includes(role);
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    initializing: false,
    error: ""
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user && state.token),
    role: (state): Role | null => state.user?.role ?? null,
    canManage: (state): boolean => meetsMinimum(state.user?.role ?? null, "MANAGER"),
    canManageUsers: (state): boolean => (state.user?.role ?? null) === "SUPER_ADMIN"
  },
  actions: {
    hasMinimumRole(target: Role) {
      return meetsMinimum(this.user?.role ?? null, target);
    },
    hasRole(target: Role | Role[]) {
      const list = Array.isArray(target) ? target : [target];
      return matchesAny(this.user?.role ?? null, list);
    },
    async login(payload: LoginPayload) {
      this.loading = true;
      this.error = "";
      try {
        const response = await loginRequest(payload);
        this.applySession(response.accessToken, response.user);
      } finally {
        this.loading = false;
      }
    },
    async register(payload: RegisterPayload) {
      this.loading = true;
      this.error = "";
      try {
        const response = await registerRequest(payload);
        this.applySession(response.accessToken, response.user);
      } finally {
        this.loading = false;
      }
    },
    async restoreSession(token: string | null) {
      if (!token) return;
      this.token = token;
      this.initializing = true;
      try {
        const user = await fetchMe();
        this.user = user;
      } catch {
        this.logout();
      } finally {
        this.initializing = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      clearStoredToken();
    },
    applySession(token: string, user: AuthUser) {
      this.token = token;
      this.user = user;
      setStoredToken(token);
    }
  }
});
