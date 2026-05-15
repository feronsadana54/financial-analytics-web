export type Summary = {
  totalRevenue: number;
  totalExpense: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalOrders: number;
  totalProductsSold: number;
  averageOrderValue: number;
  revenueGrowth: number;
  expenseGrowth: number;
};

export type TrendPoint = {
  month: string;
  revenue?: number;
  expense?: number;
  grossProfit?: number;
  netProfit?: number;
};

export type ProductPerformance = {
  productName: string;
  quantity: number;
  revenue: number;
  profit: number;
};

export type DistributionPoint = {
  name: string;
  value?: number;
  amount?: number;
};

export type Filters = {
  year: string;
  month: string;
  categoryId: string;
  productId: string;
};
