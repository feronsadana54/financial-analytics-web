<template>
  <section class="state-block">
    <div class="state-icon">{{ icon }}</div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title?: string; message?: string }>(), {
  icon: "·",
  title: "No data yet",
  message: "Add new records to get started."
});
</script>
