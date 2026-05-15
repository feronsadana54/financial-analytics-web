import { defineStore } from "pinia";
import {
  fetchCategoryDistribution,
  fetchExpenseBreakdown,
  fetchProductPerformance,
  fetchProfitTrend,
  fetchRevenueTrend,
  fetchRevenueVsExpense,
  fetchSummary
} from "../services/dashboardService";
import {
  fallbackCategories,
  fallbackExpenses,
  fallbackProducts,
  fallbackProfitTrend,
  fallbackRevenueTrend,
  fallbackRevenueVsExpense,
  fallbackSummary
} from "../services/fallbackData";
import type { DistributionPoint, Filters, ProductPerformance, Summary, TrendPoint } from "../types/dashboard";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    summary: fallbackSummary as Summary,
    revenueTrend: fallbackRevenueTrend as TrendPoint[],
    profitTrend: fallbackProfitTrend as TrendPoint[],
    revenueVsExpense: fallbackRevenueVsExpense as TrendPoint[],
    productPerformance: fallbackProducts as ProductPerformance[],
    categoryDistribution: fallbackCategories as DistributionPoint[],
    expenseBreakdown: fallbackExpenses as DistributionPoint[],
    loading: false,
    error: "",
    usingFallback: true
  }),
  actions: {
    async load(filters: Filters) {
      this.loading = true;
      this.error = "";
      try {
        const [summary, revenueTrend, profitTrend, revenueVsExpense, productPerformance, categoryDistribution, expenseBreakdown] = await Promise.all([
          fetchSummary(filters),
          fetchRevenueTrend(filters),
          fetchProfitTrend(filters),
          fetchRevenueVsExpense(filters),
          fetchProductPerformance(filters),
          fetchCategoryDistribution(filters),
          fetchExpenseBreakdown(filters)
        ]);
        this.summary = summary;
        this.revenueTrend = revenueTrend;
        this.profitTrend = profitTrend;
        this.revenueVsExpense = revenueVsExpense;
        this.productPerformance = productPerformance;
        this.categoryDistribution = categoryDistribution;
        this.expenseBreakdown = expenseBreakdown;
        this.usingFallback = false;
      } catch {
        this.summary = fallbackSummary;
        this.revenueTrend = fallbackRevenueTrend;
        this.profitTrend = fallbackProfitTrend;
        this.revenueVsExpense = fallbackRevenueVsExpense;
        this.productPerformance = fallbackProducts;
        this.categoryDistribution = fallbackCategories;
        this.expenseBreakdown = fallbackExpenses;
        this.usingFallback = true;
        this.error = "Backend API is not reachable. Showing portfolio sample data.";
      } finally {
        this.loading = false;
      }
    }
  }
});
