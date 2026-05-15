<template>
  <section class="table-panel">
    <div class="section-heading">
      <h2>Product Performance</h2>
      <span>{{ rows.length }} products</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Units</th>
            <th>Revenue</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.productName">
            <td>{{ row.productName }}</td>
            <td>{{ row.quantity }}</td>
            <td>{{ formatCurrency(row.revenue) }}</td>
            <td>{{ formatCurrency(row.profit) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductPerformance } from "../../types/dashboard";
import { formatCurrency } from "../../utils/formatters";

defineProps<{ rows: ProductPerformance[] }>();
</script>
