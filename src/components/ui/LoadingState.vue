<template>
  <section class="state-block">
    <div class="state-spinner" aria-hidden="true"></div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; message?: string }>(), {
  title: "Loading",
  message: "Preparing data..."
});
</script>
