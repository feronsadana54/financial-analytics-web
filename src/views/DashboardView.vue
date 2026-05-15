<template>
  <div class="dashboard-page">
    <FilterPanel v-model="filters" @apply="store.load(filters)" />

    <LoadingState v-if="store.loading" title="Loading analytics" message="Preparing dashboard metrics and visualizations." />
    <EmptyState v-else-if="isEmpty" icon="0" title="No data available" message="Adjust the filter or seed the backend database." />

    <template v-else>
      <div v-if="store.error" class="banner-warning">{{ store.error }}</div>

      <section class="kpi-grid">
        <StatCard label="Total Revenue" :value="formatCurrency(store.summary.totalRevenue)" :trend="store.summary.revenueGrowth" />
        <StatCard label="Total Expense" :value="formatCurrency(store.summary.totalExpense)" :trend="store.summary.expenseGrowth" />
        <StatCard label="Gross Profit" :value="formatCurrency(store.summary.grossProfit)" :trend="7.8" />
        <StatCard label="Net Profit" :value="formatCurrency(store.summary.netProfit)" :trend="6.4" />
        <StatCard label="Profit Margin" :value="formatPercent(store.summary.profitMargin)" :trend="1.2" />
        <StatCard label="Total Orders" :value="store.summary.totalOrders.toString()" :trend="5.9" />
        <StatCard label="Products Sold" :value="store.summary.totalProductsSold.toString()" :trend="4.1" />
        <StatCard label="Average Order Value" :value="formatCurrency(store.summary.averageOrderValue)" :trend="2.7" />
      </section>

      <section class="overall-insight">
        <InsightCard heading="Overall business summary" :insight="overallInsight" />
      </section>

      <section class="chart-grid">
        <article class="chart-panel wide">
          <div class="section-heading">
            <h2>Revenue Trend</h2>
            <span>Monthly revenue</span>
          </div>
          <BaseChart :option="revenueOption" />
          <InsightCard heading="Revenue trend" :insight="revenueInsight" />
        </article>

        <article class="chart-panel">
          <div class="section-heading">
            <h2>Category Distribution</h2>
            <span>Revenue share</span>
          </div>
          <BaseChart :option="categoryOption" />
          <InsightCard heading="Category distribution" :insight="categoryInsight" />
        </article>

        <article class="chart-panel">
          <div class="section-heading">
            <h2>Expense Breakdown</h2>
            <span>Cost structure</span>
          </div>
          <BaseChart :option="expenseOption" />
          <InsightCard heading="Expense breakdown" :insight="expenseInsight" />
        </article>

        <article class="chart-panel wide">
          <div class="section-heading">
            <h2>Revenue vs Expense</h2>
            <span>Monthly comparison</span>
          </div>
          <BaseChart :option="comparisonOption" />
          <InsightCard heading="Revenue vs expense" :insight="comparisonInsight" />
        </article>

        <article class="chart-panel">
          <div class="section-heading">
            <h2>Profit Trend</h2>
            <span>Net profit area</span>
          </div>
          <BaseChart :option="profitOption" />
          <InsightCard heading="Profit trend" :insight="profitInsight" />
        </article>

        <article class="chart-panel">
          <div class="section-heading">
            <h2>Top Products</h2>
            <span>Revenue ranking</span>
          </div>
          <BaseChart :option="topProductsOption" />
          <InsightCard heading="Product performance" :insight="productInsight" />
        </article>
      </section>

      <ProductTable :rows="store.productPerformance" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseChart from "../components/charts/BaseChart.vue";
import FilterPanel from "../components/dashboard/FilterPanel.vue";
import ProductTable from "../components/dashboard/ProductTable.vue";
import InsightCard from "../components/dashboard/InsightCard.vue";
import EmptyState from "../components/ui/EmptyState.vue";
import LoadingState from "../components/ui/LoadingState.vue";
import StatCard from "../components/ui/StatCard.vue";
import { useDashboardStore } from "../stores/dashboard";
import type { Filters } from "../types/dashboard";
import {
  generateCategoryInsight,
  generateExpenseInsight,
  generateOverallInsight,
  generateProductInsight,
  generateProfitInsight,
  generateRevenueInsight,
  generateRevenueVsExpenseInsight
} from "../utils/dashboardInsight";
import { formatCompact, formatCurrency, formatPercent } from "../utils/formatters";

const store = useDashboardStore();
const filters = ref<Filters>({ year: "2025", month: "", categoryId: "", productId: "" });
const axisLabel = { color: "#64748b" };
const grid = { left: 42, right: 24, top: 30, bottom: 36 };

const isEmpty = computed(() => !store.loading && store.revenueTrend.length === 0 && store.productPerformance.length === 0);

const revenueOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid,
  xAxis: { type: "category", data: store.revenueTrend.map((item) => item.month), axisLabel },
  yAxis: { type: "value", axisLabel: { formatter: (value: number) => formatCompact(value), color: "#64748b" } },
  series: [{ type: "line", smooth: true, data: store.revenueTrend.map((item) => item.revenue ?? 0), lineStyle: { width: 4, color: "#0f766e" }, itemStyle: { color: "#0f766e" } }]
}));

const categoryOption = computed(() => ({
  tooltip: { trigger: "item" },
  series: [{ type: "pie", radius: ["48%", "72%"], data: store.categoryDistribution.map((item) => ({ name: item.name, value: item.value ?? 0 })) }]
}));

const expenseOption = computed(() => ({
  tooltip: { trigger: "item" },
  grid,
  xAxis: { type: "value", axisLabel: { formatter: (value: number) => formatCompact(value), color: "#64748b" } },
  yAxis: { type: "category", data: store.expenseBreakdown.map((item) => item.name), axisLabel },
  series: [{ type: "bar", data: store.expenseBreakdown.map((item) => item.amount ?? 0), itemStyle: { color: "#f97316", borderRadius: [0, 6, 6, 0] } }]
}));

const comparisonOption = computed(() => ({
  tooltip: { trigger: "axis" },
  legend: { top: 0 },
  grid: { ...grid, top: 44 },
  xAxis: { type: "category", data: store.revenueVsExpense.map((item) => item.month), axisLabel },
  yAxis: { type: "value", axisLabel: { formatter: (value: number) => formatCompact(value), color: "#64748b" } },
  series: [
    { name: "Revenue", type: "bar", data: store.revenueVsExpense.map((item) => item.revenue ?? 0), itemStyle: { color: "#0f766e", borderRadius: [6, 6, 0, 0] } },
    { name: "Expense", type: "bar", data: store.revenueVsExpense.map((item) => item.expense ?? 0), itemStyle: { color: "#f97316", borderRadius: [6, 6, 0, 0] } }
  ]
}));

const profitOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid,
  xAxis: { type: "category", data: store.profitTrend.map((item) => item.month), axisLabel },
  yAxis: { type: "value", axisLabel: { formatter: (value: number) => formatCompact(value), color: "#64748b" } },
  series: [{ type: "line", smooth: true, areaStyle: { color: "rgba(15, 118, 110, 0.16)" }, data: store.profitTrend.map((item) => item.netProfit ?? 0), itemStyle: { color: "#0f766e" } }]
}));

const topProductsOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid,
  xAxis: { type: "value", axisLabel: { formatter: (value: number) => formatCompact(value), color: "#64748b" } },
  yAxis: { type: "category", data: store.productPerformance.slice(0, 7).map((item) => item.productName), axisLabel },
  series: [{ type: "bar", data: store.productPerformance.slice(0, 7).map((item) => item.revenue), itemStyle: { color: "#2563eb", borderRadius: [0, 6, 6, 0] } }]
}));

const overallInsight = computed(() => generateOverallInsight(store.summary));
const revenueInsight = computed(() => generateRevenueInsight(store.revenueTrend, store.summary));
const profitInsight = computed(() => generateProfitInsight(store.profitTrend, store.summary));
const expenseInsight = computed(() => generateExpenseInsight(store.expenseBreakdown, store.summary));
const productInsight = computed(() => generateProductInsight(store.productPerformance));
const categoryInsight = computed(() => generateCategoryInsight(store.categoryDistribution));
const comparisonInsight = computed(() => generateRevenueVsExpenseInsight(store.revenueVsExpense, store.summary));

onMounted(() => store.load(filters.value));
</script>
