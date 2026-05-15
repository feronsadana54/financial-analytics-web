<template>
  <div v-if="open" class="modal-backdrop" role="dialog" aria-modal="true" @click.self="$emit('cancel')">
    <div class="modal modal-sm">
      <header class="modal-header">
        <h3>{{ title }}</h3>
      </header>
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      <footer class="modal-footer">
        <button type="button" class="btn-secondary" :disabled="loading" @click="$emit('cancel')">{{ cancelLabel }}</button>
        <button type="button" class="btn-danger" :disabled="loading" @click="$emit('confirm')">{{ loading ? "Working..." : confirmLabel }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
  }>(),
  {
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    loading: false
  }
);
defineEmits<{ confirm: []; cancel: [] }>();
</script>
