<template>
  <article class="kpi-card">
    <div class="kpi-card-main">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
      <p v-if="subtitle" class="kpi-subtitle">{{ subtitle }}</p>
    </div>
    <p v-if="trend !== undefined" class="kpi-trend" :class="trendClass">{{ trendLabel }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ label: string; value: string; trend?: number; subtitle?: string }>();
const trendValue = computed(() => props.trend ?? 0);
const trendClass = computed(() => (trendValue.value >= 0 ? "positive" : "negative"));
const trendLabel = computed(() => `${trendValue.value >= 0 ? "+" : ""}${trendValue.value.toFixed(1)}%`);
</script>
