import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { render, fireEvent } from "@testing-library/vue";

vi.mock("../src/services/authService", () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn()
}));

import LoginView from "../src/views/LoginView.vue";
import { useAuthStore } from "../src/stores/auth";
import { login } from "../src/services/authService";

const buildRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: { template: "<div />" } },
      { path: "/login", name: "login", component: LoginView },
      { path: "/dashboard", name: "dashboard", component: { template: "<div />" } }
    ]
  });

describe("LoginView", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders email, password, and submit button", async () => {
    const router = buildRouter();
    router.push("/login");
    await router.isReady();
    const { getByLabelText, getByRole } = render(LoginView, { global: { plugins: [router] } });

    expect(getByLabelText(/email/i)).toBeTruthy();
    expect(getByLabelText(/password/i)).toBeTruthy();
    expect(getByRole("button", { name: /sign in/i })).toBeTruthy();
  });

  it("calls auth store login on submit", async () => {
    const router = buildRouter();
    router.push("/login");
    await router.isReady();
    const auth = useAuthStore();
    const spy = vi.spyOn(auth, "login").mockResolvedValue();

    const { getByLabelText, getByRole } = render(LoginView, { global: { plugins: [router] } });

    await fireEvent.update(getByLabelText(/email/i), "admin@financial.local");
    await fireEvent.update(getByLabelText(/password/i), "Admin12345");
    await fireEvent.click(getByRole("button", { name: /sign in/i }));

    expect(spy).toHaveBeenCalledWith({ email: "admin@financial.local", password: "Admin12345" });
  });

  it("shows error when login fails", async () => {
    const router = buildRouter();
    router.push("/login");
    await router.isReady();
    (login as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Invalid email or password"));
    const auth = useAuthStore();
    vi.spyOn(auth, "login").mockRejectedValue(new Error("Invalid email or password"));

    const { getByLabelText, getByRole, findByRole } = render(LoginView, { global: { plugins: [router] } });

    await fireEvent.update(getByLabelText(/email/i), "no@x.com");
    await fireEvent.update(getByLabelText(/password/i), "wrongpass");
    await fireEvent.click(getByRole("button", { name: /sign in/i }));

    const alert = await findByRole("alert");
    expect(alert.textContent).toContain("Invalid");
  });
});
