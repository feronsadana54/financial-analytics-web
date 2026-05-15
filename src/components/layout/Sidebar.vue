<template>
  <aside class="sidebar" :class="{ open }">
    <RouterLink to="/dashboard" class="brand" @click="$emit('navigate')">
      <img src="/src/assets/analytics-mark.svg" alt="Financial Analytics" />
      <span>FinSight</span>
    </RouterLink>
    <nav>
      <RouterLink v-for="link in visibleLinks" :key="link.path" :to="link.path" @click="$emit('navigate')">{{ link.label }}</RouterLink>
    </nav>
    <div class="sidebar-footer">
      <p class="sidebar-user-name">{{ auth.user?.name ?? "Guest" }}</p>
      <RoleBadge v-if="auth.user" :role="auth.user.role" />
      <button type="button" class="btn-secondary block" @click="handleLogout">Sign out</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import RoleBadge from "../ui/RoleBadge.vue";
import type { Role } from "../../types/auth";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ navigate: []; close: [] }>();

const auth = useAuthStore();
const router = useRouter();

type NavLink = { path: string; label: string; roles?: Role[] };

const links: NavLink[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/products", label: "Products" },
  { path: "/categories", label: "Categories" },
  { path: "/sales", label: "Sales" },
  { path: "/expenses", label: "Expenses" },
  { path: "/users", label: "Users", roles: ["MANAGER", "SUPER_ADMIN"] }
];

const visibleLinks = computed(() => links.filter((link) => !link.roles || auth.hasRole(link.roles)));

async function handleLogout() {
  auth.logout();
  emit("close");
  await router.push("/login");
}
</script>
