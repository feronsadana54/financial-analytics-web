<template>
  <section class="state-block">
    <div class="state-icon">{{ icon }}</div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  message: string;
}>();
</script>
