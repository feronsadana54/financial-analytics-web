<template>
  <section class="state-block error">
    <div class="state-icon error" aria-hidden="true">!</div>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button v-if="retryLabel" type="button" class="btn-primary" @click="$emit('retry')">{{ retryLabel }}</button>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; message?: string; retryLabel?: string }>(), {
  title: "Something went wrong",
  message: "Please try again.",
  retryLabel: ""
});
defineEmits<{ retry: [] }>();
</script>
