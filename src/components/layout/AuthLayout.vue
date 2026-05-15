<template>
  <div class="auth-shell">
    <div class="auth-card">
      <RouterLink to="/login" class="brand brand-center">
        <img src="/src/assets/analytics-mark.svg" alt="Financial Analytics" />
        <span>FinSight</span>
      </RouterLink>
      <RouterView />
    </div>
    <div class="auth-side">
      <h2>Financial Analytics</h2>
      <p>Real-time revenue, profit and expense intelligence for growing businesses.</p>
      <ul>
        <li>Interactive dashboard with KPI, trend and insight analysis.</li>
        <li>Role-based workspace for User, Manager, and Super Admin.</li>
        <li>Manage products, categories, sales, and expenses in one place.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>
