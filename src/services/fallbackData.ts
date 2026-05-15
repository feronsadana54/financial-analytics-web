import type { DistributionPoint, ProductPerformance, Summary, TrendPoint } from "../types/dashboard";

export const fallbackSummary: Summary = {
  totalRevenue: 1234200000,
  totalExpense: 413800000,
  grossProfit: 557900000,
  netProfit: 144100000,
  profitMargin: 11.68,
  totalOrders: 72,
  totalProductsSold: 846,
  averageOrderValue: 17141666.67,
  revenueGrowth: 8.7,
  expenseGrowth: 4.2
};

export const fallbackRevenueTrend: TrendPoint[] = [
  { month: "2025-01", revenue: 81200000 },
  { month: "2025-02", revenue: 89300000 },
  { month: "2025-03", revenue: 94500000 },
  { month: "2025-04", revenue: 99700000 },
  { month: "2025-05", revenue: 104900000 },
  { month: "2025-06", revenue: 112300000 },
  { month: "2025-07", revenue: 118600000 },
  { month: "2025-08", revenue: 121400000 },
  { month: "2025-09", revenue: 127900000 },
  { month: "2025-10", revenue: 132500000 },
  { month: "2025-11", revenue: 138100000 },
  { month: "2025-12", revenue: 145800000 }
];

export const fallbackProfitTrend: TrendPoint[] = fallbackRevenueTrend.map((item, index) => ({
  month: item.month,
  grossProfit: Math.round((item.revenue ?? 0) * 0.46),
  expense: 28500000 + index * 900000,
  netProfit: Math.round((item.revenue ?? 0) * 0.46 - (28500000 + index * 900000))
}));

export const fallbackRevenueVsExpense: TrendPoint[] = fallbackRevenueTrend.map((item, index) => ({
  month: item.month,
  revenue: item.revenue,
  expense: 31000000 + index * 1150000
}));

export const fallbackProducts: ProductPerformance[] = [
  { productName: "Implementation Package", quantity: 24, revenue: 300000000, profit: 151200000 },
  { productName: "Analytics Pro License", quantity: 96, revenue: 403200000, profit: 273600000 },
  { productName: "CRM Growth Suite", quantity: 78, revenue: 280800000, profit: 195000000 },
  { productName: "POS Terminal X2", quantity: 42, revenue: 243600000, profit: 79800000 },
  { productName: "Priority Support", quantity: 114, revenue: 239400000, profit: 142500000 },
  { productName: "Inventory Scanner", quantity: 58, revenue: 139200000, profit: 55100000 },
  { productName: "Barcode Label Pack", quantity: 188, revenue: 41360000, profit: 18800000 }
];

export const fallbackCategories: DistributionPoint[] = [
  { name: "Software", value: 684000000 },
  { name: "Services", value: 539400000 },
  { name: "Hardware", value: 382800000 },
  { name: "Accessories", value: 81000000 }
];

export const fallbackExpenses: DistributionPoint[] = [
  { name: "Payroll", amount: 247800000 },
  { name: "Marketing", amount: 118200000 },
  { name: "Operations", amount: 88200000 },
  { name: "Software Tools", amount: 57300000 }
];
