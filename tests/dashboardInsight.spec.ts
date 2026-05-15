import { describe, expect, it } from "vitest";
import {
  generateCategoryInsight,
  generateExpenseInsight,
  generateOverallInsight,
  generateProductInsight,
  generateProfitInsight,
  generateRevenueInsight,
  generateRevenueVsExpenseInsight
} from "../src/utils/dashboardInsight";
import type { Summary } from "../src/types/dashboard";

const sampleSummary: Summary = {
  totalRevenue: 1_000_000,
  totalExpense: 600_000,
  grossProfit: 500_000,
  netProfit: 200_000,
  profitMargin: 20,
  totalOrders: 50,
  totalProductsSold: 200,
  averageOrderValue: 20_000,
  revenueGrowth: 12,
  expenseGrowth: 5
};

describe("dashboardInsight", () => {
  it("returns a positive tone when revenue grows", () => {
    const insight = generateRevenueInsight(
      [
        { month: "2025-01", revenue: 80_000 },
        { month: "2025-02", revenue: 120_000 }
      ],
      sampleSummary
    );
    expect(insight.tone).toBe("positive");
    expect(insight.summary).toContain("Revenue");
    expect(insight.recommendation).not.toBe("");
  });

  it("flags negative tone when net profit is below zero", () => {
    const negativeSummary: Summary = { ...sampleSummary, netProfit: -100, profitMargin: -2 };
    const insight = generateProfitInsight(
      [
        { month: "2025-01", netProfit: -50 },
        { month: "2025-02", netProfit: -100 }
      ],
      negativeSummary
    );
    expect(insight.tone).toBe("negative");
  });

  it("warns when expenses dominate revenue", () => {
    const heavySummary: Summary = { ...sampleSummary, totalExpense: 950_000 };
    const insight = generateExpenseInsight(
      [
        { name: "Payroll", amount: 700_000 },
        { name: "Marketing", amount: 250_000 }
      ],
      heavySummary
    );
    expect(insight.tone).toBe("negative");
    expect(insight.analysis).toContain("expense");
  });

  it("highlights product concentration", () => {
    const insight = generateProductInsight([
      { productName: "Hero Product", quantity: 50, revenue: 800, profit: 300 },
      { productName: "Second", quantity: 10, revenue: 200, profit: 80 }
    ]);
    expect(insight.tone).toBe("warning");
    expect(insight.summary).toContain("Hero Product");
  });

  it("returns neutral insight on empty data", () => {
    expect(generateRevenueInsight([], sampleSummary).tone).toBe("neutral");
    expect(generateProfitInsight([], sampleSummary).tone).toBe("neutral");
    expect(generateExpenseInsight([], sampleSummary).tone).toBe("neutral");
    expect(generateProductInsight([]).tone).toBe("neutral");
    expect(generateCategoryInsight([]).tone).toBe("neutral");
    expect(generateRevenueVsExpenseInsight([], sampleSummary).tone).toBe("neutral");
  });

  it("returns overall insight reflecting healthy operations", () => {
    const insight = generateOverallInsight(sampleSummary);
    expect(insight.tone).toBe("positive");
    expect(insight.summary).toContain("revenue");
  });
});
