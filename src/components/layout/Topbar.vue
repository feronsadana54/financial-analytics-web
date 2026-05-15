<template>
  <header class="topbar">
    <button type="button" class="menu-toggle" aria-label="Toggle navigation" @click="$emit('toggle-menu')">
      <span></span><span></span><span></span>
    </button>
    <div class="topbar-titles">
      <p>{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
    </div>
    <div class="topbar-actions">
      <div v-if="auth.user" class="user-chip">
        <div class="avatar" aria-hidden="true">{{ initials }}</div>
        <div class="user-meta">
          <strong>{{ auth.user.name }}</strong>
          <RoleBadge :role="auth.user.role" />
        </div>
      </div>
      <button type="button" class="theme-toggle" @click="$emit('toggle-theme')">{{ isDark ? "Light" : "Dark" }}</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";
import RoleBadge from "../ui/RoleBadge.vue";

defineProps<{ title: string; eyebrow: string; isDark: boolean }>();
defineEmits<{ "toggle-theme": []; "toggle-menu": [] }>();

const auth = useAuthStore();
const initials = computed(() => {
  if (!auth.user) return "?";
  return auth.user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
});
</script>
