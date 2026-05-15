<template>
  <header class="page-header">
    <div>
      <p>{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; subtitle?: string }>();
</script>
