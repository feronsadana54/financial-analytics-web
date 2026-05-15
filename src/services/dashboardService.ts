import { getData } from "./api";
import type { DistributionPoint, Filters, ProductPerformance, Summary, TrendPoint } from "../types/dashboard";

function buildParams(filters: Filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) as Record<string, string>;
}

export function fetchSummary(filters: Filters) {
  return getData<Summary>("/dashboard/summary", buildParams(filters));
}

export function fetchRevenueTrend(filters: Filters) {
  return getData<TrendPoint[]>("/dashboard/revenue-trend", buildParams(filters));
}

export function fetchProfitTrend(filters: Filters) {
  return getData<TrendPoint[]>("/dashboard/profit-trend", buildParams(filters));
}

export function fetchRevenueVsExpense(filters: Filters) {
  return getData<TrendPoint[]>("/dashboard/revenue-vs-expense", buildParams(filters));
}

export function fetchProductPerformance(filters: Filters) {
  return getData<ProductPerformance[]>("/dashboard/product-performance", buildParams(filters));
}

export function fetchCategoryDistribution(filters: Filters) {
  return getData<DistributionPoint[]>("/dashboard/category-distribution", buildParams(filters));
}

export function fetchExpenseBreakdown(filters: Filters) {
  return getData<DistributionPoint[]>("/dashboard/expense-breakdown", buildParams(filters));
}
