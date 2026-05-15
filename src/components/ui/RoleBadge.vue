<template>
  <span class="badge" :class="`badge-${role.toLowerCase()}`">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Role } from "../../types/auth";

const props = defineProps<{ role: Role }>();
const labels: Record<Role, string> = {
  USER: "User",
  MANAGER: "Manager",
  SUPER_ADMIN: "Super Admin"
};
const label = computed(() => labels[props.role]);
</script>
