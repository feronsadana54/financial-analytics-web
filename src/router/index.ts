import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import AuthLayout from "../components/layout/AuthLayout.vue";
import ProtectedLayout from "../components/layout/ProtectedLayout.vue";
import { useAuthStore } from "../stores/auth";
import type { Role } from "../types/auth";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: Role[];
    title?: string;
    eyebrow?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      { path: "", redirect: "/login" },
      { path: "login", name: "login", component: () => import("../views/LoginView.vue") },
      { path: "register", name: "register", component: () => import("../views/RegisterView.vue") }
    ]
  },
  {
    path: "/",
    component: ProtectedLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("../views/DashboardView.vue"),
        meta: { title: "Financial Analytics Dashboard", eyebrow: "Business Intelligence" }
      },
      {
        path: "products",
        name: "products",
        component: () => import("../views/ProductsView.vue"),
        meta: { title: "Products", eyebrow: "Catalog Management" }
      },
      {
        path: "categories",
        name: "categories",
        component: () => import("../views/CategoriesView.vue"),
        meta: { title: "Categories", eyebrow: "Catalog Management" }
      },
      {
        path: "sales",
        name: "sales",
        component: () => import("../views/SalesView.vue"),
        meta: { title: "Sales Transactions", eyebrow: "Revenue Operations" }
      },
      {
        path: "expenses",
        name: "expenses",
        component: () => import("../views/ExpensesView.vue"),
        meta: { title: "Expenses", eyebrow: "Cost Operations" }
      },
      {
        path: "users",
        name: "users",
        component: () => import("../views/UsersView.vue"),
        meta: { title: "User Management", eyebrow: "Access Control", roles: ["MANAGER", "SUPER_ADMIN"] }
      },
      {
        path: "management",
        name: "management",
        component: () => import("../views/ManagementView.vue"),
        meta: { title: "Management Workspace", eyebrow: "Operations" }
      },
      {
        path: "unauthorized",
        name: "unauthorized",
        component: () => import("../views/UnauthorizedView.vue"),
        meta: { title: "Access restricted", eyebrow: "Permissions" }
      }
    ]
  },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.initializing) {
    await new Promise<void>((resolve) => {
      const stop = setInterval(() => {
        if (!auth.initializing) {
          clearInterval(stop);
          resolve();
        }
      }, 25);
    });
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "dashboard" };
  }

  if (to.meta.roles && to.meta.roles.length > 0 && !auth.hasRole(to.meta.roles as Role[])) {
    return { name: "unauthorized" };
  }

  return true;
});

export default router;
