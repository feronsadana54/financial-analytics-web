<template>
  <section class="page">
    <PageHeader eyebrow="Operations" title="Management Workspace" subtitle="Choose what you want to manage." />

    <div class="management-grid">
      <RouterLink v-for="item in items" :key="item.path" :to="item.path" class="management-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import PageHeader from "../components/ui/PageHeader.vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const baseItems = [
  { path: "/products", title: "Products", description: "Maintain catalog, SKU, pricing, cost, and stock data." },
  { path: "/categories", title: "Categories", description: "Organize products for revenue and margin reporting." },
  { path: "/sales", title: "Sales", description: "Capture orders and product line items." },
  { path: "/expenses", title: "Expenses", description: "Track operational costs by date and expense category." }
];

const items = computed(() => {
  const all = [...baseItems];
  if (auth.canManageUsers) {
    all.push({ path: "/users", title: "Users", description: "Manage workspace members, roles, and access." });
  }
  return all;
});
</script>
