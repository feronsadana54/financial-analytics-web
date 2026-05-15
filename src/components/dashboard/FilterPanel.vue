<template>
  <section class="filter-panel">
    <label>
      Year
      <select v-model="model.year">
        <option value="">All years</option>
        <option value="2025">2025</option>
      </select>
    </label>
    <label>
      Month
      <select v-model="model.month">
        <option value="">All months</option>
        <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
      </select>
    </label>
    <label>
      Category
      <select v-model="model.categoryId">
        <option value="">All categories</option>
      </select>
    </label>
    <label>
      Product
      <select v-model="model.productId">
        <option value="">All products</option>
      </select>
    </label>
    <button type="button" @click="$emit('apply')">Apply</button>
  </section>
</template>

<script setup lang="ts">
import type { Filters } from "../../types/dashboard";

const model = defineModel<Filters>({ required: true });
defineEmits<{ apply: [] }>();

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];
</script>
