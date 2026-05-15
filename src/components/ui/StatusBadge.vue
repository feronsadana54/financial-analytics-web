<template>
  <span class="badge" :class="`badge-status-${status.toLowerCase()}`">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UserStatus } from "../../types/auth";

const props = defineProps<{ status: UserStatus }>();
const label = computed(() => (props.status === "ACTIVE" ? "Active" : "Inactive"));
</script>
