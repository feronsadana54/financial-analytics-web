<template>
  <article class="kpi-card">
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
    <p :class="trend >= 0 ? 'positive' : 'negative'">{{ trendLabel }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  value: string;
  trend?: number;
}>();

const trend = computed(() => props.trend ?? 0);
const trendLabel = computed(() => `${trend.value >= 0 ? "+" : ""}${trend.value.toFixed(1)}%`);
</script>
