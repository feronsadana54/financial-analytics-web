<template>
  <div v-if="open" class="modal-backdrop" role="dialog" aria-modal="true" @click.self="$emit('close')">
    <form class="modal" @submit.prevent="$emit('submit')">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button type="button" class="modal-close" aria-label="Close" @click="$emit('close')">&times;</button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer class="modal-footer">
        <button type="button" class="btn-secondary" :disabled="submitting" @click="$emit('close')">Cancel</button>
        <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? "Saving..." : submitLabel }}</button>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ open: boolean; title: string; submitLabel?: string; submitting?: boolean }>(),
  { submitLabel: "Save", submitting: false }
);
defineEmits<{ close: []; submit: [] }>();
</script>
