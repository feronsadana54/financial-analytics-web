import axios, { type AxiosRequestConfig } from "axios";

const TOKEN_STORAGE_KEY = "financial-analytics.token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  timeout: 12000
});

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

type ApiHandlers = {
  onUnauthorized?: () => void;
};

const handlers: ApiHandlers = {};

export function configureApi(next: ApiHandlers) {
  handlers.onUnauthorized = next.onUnauthorized;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      handlers.onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

type Envelope<T> = { success: boolean; message: string; data: T };

export async function getData<T>(url: string, params?: Record<string, string>): Promise<T> {
  const response = await api.get<Envelope<T>>(url, { params });
  return response.data.data;
}

export async function postData<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<Envelope<T>>(url, body, config);
  return response.data.data;
}

export async function patchData<T>(url: string, body?: unknown): Promise<T> {
  const response = await api.patch<Envelope<T>>(url, body);
  return response.data.data;
}

export async function deleteData<T>(url: string): Promise<T> {
  const response = await api.delete<Envelope<T>>(url);
  return response.data.data;
}

export function extractErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
