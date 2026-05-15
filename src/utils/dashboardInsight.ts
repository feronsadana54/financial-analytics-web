import type { DistributionPoint, ProductPerformance, Summary, TrendPoint } from "../types/dashboard";
import { formatCompact, formatCurrency, formatPercent } from "./formatters";

export type Insight = {
  summary: string;
  analysis: string;
  impact: string;
  recommendation: string;
  tone: "positive" | "warning" | "negative" | "neutral";
};

function pickTone(value: number, positiveAbove = 0, warningBelow = 0): Insight["tone"] {
  if (value > positiveAbove) return "positive";
  if (value < warningBelow) return "negative";
  return "warning";
}

function trendDirection(diff: number) {
  if (diff > 1) return "naik";
  if (diff < -1) return "turun";
  return "stagnan";
}

function safePercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export function generateRevenueInsight(trend: TrendPoint[], summary: Summary): Insight {
  if (trend.length === 0) {
    return {
      summary: "Belum ada data revenue untuk periode ini.",
      analysis: "Sistem belum menerima transaksi untuk dianalisis.",
      impact: "Tidak ada gambaran pertumbuhan yang bisa diukur.",
      recommendation: "Mulai catat transaksi penjualan agar tren revenue dapat dipantau.",
      tone: "neutral"
    };
  }

  const last = trend[trend.length - 1].revenue ?? 0;
  const prev = trend.length > 1 ? trend[trend.length - 2].revenue ?? 0 : 0;
  const change = safePercent(last, prev);
  const direction = trendDirection(change);
  const tone = pickTone(change, 1, -1);

  return {
    summary: `Revenue periode terakhir tercatat ${formatCurrency(last)} dengan pertumbuhan ${formatPercent(summary.revenueGrowth)}.`,
    analysis: `Dibandingkan periode sebelumnya, revenue ${direction} ${formatPercent(change)}. Total revenue terkumpul ${formatCurrency(summary.totalRevenue)} dari ${summary.totalOrders} transaksi.`,
    impact:
      tone === "positive"
        ? "Momentum penjualan menguat dan menjadi sinyal positif untuk pertumbuhan bisnis."
        : tone === "negative"
          ? "Penurunan revenue dapat menekan margin dan cash flow jangka pendek."
          : "Revenue cenderung datar sehingga pertumbuhan belum optimal.",
    recommendation:
      tone === "positive"
        ? "Pertahankan strategi marketing yang berhasil dan perluas channel penjualan dengan performa terbaik."
        : tone === "negative"
          ? "Evaluasi funnel penjualan, promo, dan kanal akuisisi untuk mengembalikan pertumbuhan."
          : "Uji strategi growth baru seperti cross-sell atau bundling agar revenue kembali bergerak.",
    tone
  };
}

export function generateProfitInsight(trend: TrendPoint[], summary: Summary): Insight {
  if (trend.length === 0) {
    return {
      summary: "Belum ada data profit untuk periode ini.",
      analysis: "Tidak ada transaksi atau biaya yang tercatat untuk perhitungan profit.",
      impact: "Kesehatan margin belum dapat dievaluasi.",
      recommendation: "Pastikan pencatatan penjualan dan biaya konsisten setiap bulan.",
      tone: "neutral"
    };
  }
  const last = trend[trend.length - 1].netProfit ?? 0;
  const prev = trend.length > 1 ? trend[trend.length - 2].netProfit ?? 0 : 0;
  const change = safePercent(last, prev);
  const tone = pickTone(change, 1, -1);

  return {
    summary: `Net profit terakhir ${formatCurrency(last)} dengan margin ${formatPercent(summary.profitMargin)}.`,
    analysis: `Net profit ${trendDirection(change)} ${formatPercent(change)} dibanding periode sebelumnya. Gross profit kumulatif mencapai ${formatCurrency(summary.grossProfit)}.`,
    impact:
      summary.netProfit > 0 && tone === "positive"
        ? "Profitabilitas membaik dan memberi ruang reinvestasi."
        : summary.netProfit > 0
          ? "Profitabilitas masih positif tetapi belum tumbuh signifikan."
          : "Bisnis berisiko menghasilkan kerugian operasional.",
    recommendation:
      summary.profitMargin < 10
        ? "Tinjau struktur biaya dan harga jual; tingkatkan kontribusi produk margin tinggi."
        : "Pertahankan disiplin biaya dan tingkatkan volume produk dengan margin terbaik.",
    tone: summary.netProfit > 0 ? tone : "negative"
  };
}

export function generateExpenseInsight(breakdown: DistributionPoint[], summary: Summary): Insight {
  if (breakdown.length === 0) {
    return {
      summary: "Belum ada data expense yang tercatat.",
      analysis: "Tidak ada data biaya operasional untuk dianalisis.",
      impact: "Efisiensi biaya tidak dapat diukur.",
      recommendation: "Catat seluruh biaya operasional agar pengendalian biaya berjalan.",
      tone: "neutral"
    };
  }
  const sorted = [...breakdown].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
  const top = sorted[0];
  const total = breakdown.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const topShare = total === 0 ? 0 : ((top.amount ?? 0) / total) * 100;
  const expenseRatio = summary.totalRevenue === 0 ? 0 : (summary.totalExpense / summary.totalRevenue) * 100;
  const tone = pickTone(-expenseRatio, -70, -90);

  return {
    summary: `Biaya didominasi kategori ${top.name} sebesar ${formatCurrency(top.amount ?? 0)} (${formatPercent(topShare)}).`,
    analysis: `Total expense periode ini ${formatCurrency(summary.totalExpense)} atau ${formatPercent(expenseRatio)} dari revenue. Pertumbuhan expense tercatat ${formatPercent(summary.expenseGrowth)}.`,
    impact:
      expenseRatio > 90
        ? "Struktur biaya hampir setara revenue sehingga margin sangat tipis."
        : expenseRatio > 70
          ? "Biaya operasional cukup besar dan perlu dimonitor agar tidak menggerus profit."
          : "Struktur biaya masih sehat dan memberi ruang ekspansi.",
    recommendation:
      topShare > 50
        ? `Pertimbangkan negosiasi ulang atau efisiensi pada kategori ${top.name} karena porsinya dominan.`
        : "Lakukan audit periodik agar setiap kategori biaya tetap terkendali.",
    tone
  };
}

export function generateProductInsight(performance: ProductPerformance[]): Insight {
  if (performance.length === 0) {
    return {
      summary: "Belum ada data performa produk.",
      analysis: "Tidak ada item terjual pada periode ini.",
      impact: "Tidak dapat menilai kontribusi produk terhadap revenue.",
      recommendation: "Pastikan SKU dan transaksi tercatat agar analisis produk bisa berjalan.",
      tone: "neutral"
    };
  }
  const sorted = [...performance].sort((a, b) => b.revenue - a.revenue);
  const top = sorted[0];
  const total = sorted.reduce((sum, item) => sum + item.revenue, 0);
  const share = total === 0 ? 0 : (top.revenue / total) * 100;
  const tone: Insight["tone"] = share > 50 ? "warning" : "positive";

  return {
    summary: `${top.productName} menjadi kontributor revenue terbesar dengan ${formatCurrency(top.revenue)} (${formatPercent(share)}).`,
    analysis: `Total revenue produk yang dianalisis ${formatCurrency(total)}. Top 3 produk menyumbang ${formatPercent(((sorted.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0)) / Math.max(total, 1)) * 100)}.`,
    impact:
      share > 50
        ? "Ketergantungan pada satu produk meningkatkan risiko jika permintaan berfluktuasi."
        : "Portofolio produk relatif sehat dengan kontribusi yang merata.",
    recommendation:
      share > 50
        ? "Diversifikasi penjualan dengan mendorong produk lain melalui bundling atau promosi terarah."
        : "Pertahankan strategi yang menjaga keseimbangan kontribusi produk.",
    tone
  };
}

export function generateCategoryInsight(distribution: DistributionPoint[]): Insight {
  if (distribution.length === 0) {
    return {
      summary: "Belum ada data kategori produk.",
      analysis: "Tidak ada distribusi revenue per kategori untuk dianalisis.",
      impact: "Strategi kategori produk belum bisa dievaluasi.",
      recommendation: "Catat penjualan agar distribusi kategori dapat dipetakan.",
      tone: "neutral"
    };
  }
  const sorted = [...distribution].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const top = sorted[0];
  const total = sorted.reduce((sum, item) => sum + (item.value ?? 0), 0);
  const share = total === 0 ? 0 : ((top.value ?? 0) / total) * 100;
  const tone: Insight["tone"] = share > 60 ? "warning" : "positive";
  const lowest = sorted[sorted.length - 1];

  return {
    summary: `Kategori ${top.name} mendominasi revenue dengan ${formatCurrency(top.value ?? 0)} (${formatPercent(share)}).`,
    analysis: `Total revenue dari ${sorted.length} kategori adalah ${formatCurrency(total)}. Kategori ${lowest.name} memiliki kontribusi terkecil sebesar ${formatCurrency(lowest.value ?? 0)}.`,
    impact:
      share > 60
        ? "Pertumbuhan bisnis sangat bergantung pada satu kategori dan rawan jika tren menurun."
        : "Distribusi kategori cukup sehat dan memberi fleksibilitas strategi.",
    recommendation:
      share > 60
        ? `Susun program promosi spesifik untuk meningkatkan kategori selain ${top.name}.`
        : `Kembangkan kategori ${lowest.name} agar memberi kontribusi lebih besar di periode berikutnya.`,
    tone
  };
}

export function generateRevenueVsExpenseInsight(comparison: TrendPoint[], summary: Summary): Insight {
  if (comparison.length === 0) {
    return {
      summary: "Belum ada data perbandingan revenue dan expense.",
      analysis: "Tidak ada transaksi untuk dibandingkan dengan biaya.",
      impact: "Kondisi profitabilitas tidak dapat dievaluasi.",
      recommendation: "Pastikan revenue dan expense tercatat lengkap setiap bulan.",
      tone: "neutral"
    };
  }
  const last = comparison[comparison.length - 1];
  const ratio = (last.expense ?? 0) === 0 ? 0 : ((last.expense ?? 0) / Math.max(last.revenue ?? 1, 1)) * 100;
  let tone: Insight["tone"] = "positive";
  if (ratio >= 100) tone = "negative";
  else if (ratio >= 80) tone = "warning";

  return {
    summary: `Revenue periode terakhir ${formatCompact(last.revenue ?? 0)} berbanding expense ${formatCompact(last.expense ?? 0)} (rasio ${formatPercent(ratio)}).`,
    analysis: `Secara kumulatif revenue ${formatCurrency(summary.totalRevenue)} terhadap expense ${formatCurrency(summary.totalExpense)}. Net profit menghasilkan ${formatCurrency(summary.netProfit)}.`,
    impact:
      tone === "positive"
        ? "Revenue lebih tinggi dari expense sehingga profit terjaga."
        : tone === "warning"
          ? "Selisih revenue dan expense menipis, profit rentan tergerus."
          : "Expense melebihi revenue dan bisnis berisiko rugi.",
    recommendation:
      tone === "negative"
        ? "Lakukan langkah penghematan biaya dan dorong revenue agar kembali surplus."
        : tone === "warning"
          ? "Optimalkan biaya variabel dan dorong revenue melalui upsell."
          : "Pertahankan disiplin biaya dan alokasikan profit untuk pengembangan bisnis.",
    tone
  };
}

export function generateOverallInsight(summary: Summary): Insight {
  const ratio = summary.totalRevenue === 0 ? 0 : (summary.totalExpense / summary.totalRevenue) * 100;
  const tone: Insight["tone"] = summary.netProfit > 0 && ratio < 80 ? "positive" : summary.netProfit > 0 ? "warning" : "negative";
  return {
    summary: `Total revenue ${formatCurrency(summary.totalRevenue)} dengan net profit ${formatCurrency(summary.netProfit)} dan margin ${formatPercent(summary.profitMargin)}.`,
    analysis: `Bisnis memproses ${summary.totalOrders} transaksi dengan rata-rata nilai pesanan ${formatCurrency(summary.averageOrderValue)}. Rasio expense terhadap revenue ${formatPercent(ratio)}.`,
    impact:
      tone === "positive"
        ? "Indikator utama sehat dan bisnis berada di trajectory pertumbuhan."
        : tone === "warning"
          ? "Profit positif tetapi margin perlu dijaga agar tidak menyusut."
          : "Profitabilitas tertekan dan butuh perhatian segera.",
    recommendation:
      tone === "positive"
        ? "Skala kanal penjualan unggulan dan investasi pada produk margin tinggi."
        : tone === "warning"
          ? "Tinjau biaya non-esensial dan dorong konversi penjualan baru."
          : "Susun rencana pemulihan: efisiensi biaya, evaluasi harga, dan akuisisi pelanggan.",
    tone
  };
}
