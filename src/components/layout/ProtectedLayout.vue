<template>
  <div class="app-shell" :class="{ dark: isDark }">
    <div v-if="menuOpen" class="sidebar-overlay" @click="menuOpen = false"></div>
    <Sidebar :open="menuOpen" @navigate="menuOpen = false" @close="menuOpen = false" />
    <main class="main-panel">
      <Topbar
        :title="title"
        :eyebrow="eyebrow"
        :is-dark="isDark"
        @toggle-theme="isDark = !isDark"
        @toggle-menu="menuOpen = !menuOpen"
      />
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import Sidebar from "./Sidebar.vue";
import Topbar from "./Topbar.vue";

const route = useRoute();
const isDark = ref(false);
const menuOpen = ref(false);

const title = computed(() => (route.meta.title as string) ?? "Financial Analytics");
const eyebrow = computed(() => (route.meta.eyebrow as string) ?? "Business Intelligence");

watch(() => route.path, () => {
  menuOpen.value = false;
});
</script>
