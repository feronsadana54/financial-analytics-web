# Financial Analytics Web

Financial Analytics Web adalah aplikasi dashboard Business Intelligence untuk memantau performa keuangan perusahaan penjualan produk. Aplikasi menampilkan KPI, tren pendapatan, tren profit, struktur pengeluaran, distribusi kategori, performa produk, dan tabel ringkasan operasional.

## Features

- Authentication (login, register) dengan JWT, auto-attach token, dan auto-logout pada 401
- Role-based menu dan route guard untuk USER, MANAGER, SUPER_ADMIN
- User management page (list, create, edit, role, status, soft delete) untuk SUPER_ADMIN
- CRUD pages: Products, Categories, Sales Transactions, Expenses
- Sidebar collapsible di mobile, navbar adaptif, layout responsive (desktop / tablet / mobile)
- KPI cards untuk revenue, expense, profit, margin, orders, products sold, dan average order value
- Filter tahun, bulan, kategori, dan produk
- Line chart revenue per bulan
- Bar chart pendapatan per produk
- Donut chart kategori produk
- Area chart profit trend
- Expense breakdown chart
- Comparison chart revenue vs expense
- Top selling products chart
- Insight di bawah tiap chart (Ringkasan, Analisis, Dampak, Rekomendasi)
- Loading, empty, dan error state reusable
- Dark and light mode toggle
- Fallback sample data saat backend belum berjalan

## Tech Stack

- Vue.js 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Apache ECharts
- Vitest
- Playwright
- Docker

## UI Overview

Dashboard memakai gaya SaaS analytics dengan layout padat, kartu KPI yang mudah dipindai, chart panel modular, tabel performa produk, dan filter panel di bagian atas. Warna utama menggunakan teal untuk revenue/profit, orange untuk expense, dan blue untuk ranking produk.

## Folder Structure

```text
src/
  assets/
  components/
    charts/
    dashboard/        # KpiCard, FilterPanel, ProductTable, InsightCard
    layout/           # AuthLayout, ProtectedLayout, Sidebar, Topbar
    ui/               # DataTable, FormModal, ConfirmDialog, badges, states
  router/
  services/           # api client, authService, userService, dashboardService, ...
  stores/             # auth, dashboard
  styles/
  types/              # auth, crud, dashboard
  utils/              # formatters, dashboardInsight
  views/
tests/
e2e/
```

## Environment Variables

Salin `.env.example` menjadi `.env`.

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Local Development

```powershell
npm install
copy .env.example .env
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## Connect to Backend

Pastikan backend berjalan di `http://localhost:3000`, lalu set:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Jika backend belum aktif, dashboard tetap menampilkan sample data lokal agar UI bisa ditinjau.

## Test

```powershell
npm run test
npm run test:e2e
```

## Build

```powershell
npm run build
npm run preview
```

## Docker

```powershell
docker compose up -d
```

Aplikasi berjalan di `http://localhost:8080`.

## Demo Accounts

| Role        | Email                      | Password      |
| ----------- | -------------------------- | ------------- |
| SUPER_ADMIN | admin@financial.local      | Admin12345    |
| MANAGER     | manager@financial.local    | Manager12345  |
| USER        | user@financial.local       | User12345     |

Akun di atas hanya untuk development local. Pastikan backend sudah jalan dan ter-seed.

## Pages

- `/login` — sign in form dengan demo accounts info
- `/register` — buat akun baru (default role USER)
- `/dashboard` — analytics dengan KPI, chart, dan insight (semua role)
- `/products` — list dan CRUD products
- `/categories` — list dan CRUD categories
- `/sales` — list dan CRUD sales transactions
- `/expenses` — list dan CRUD expenses
- `/users` — user management (MANAGER, SUPER_ADMIN)
- `/management` — daftar tautan management workspace
- `/unauthorized` — halaman akses ditolak

USER hanya melihat menu Dashboard, Products, Categories, Sales, Expenses dan tidak melihat Users.
MANAGER bisa melihat Users untuk referensi tetapi tidak bisa mengubah SUPER_ADMIN.
SUPER_ADMIN punya akses penuh.

## Role-Based Menu

Sidebar dinamis menyembunyikan menu yang tidak boleh diakses berdasarkan role. Selain disembunyikan, semua route juga dilindungi `beforeEach` guard di router, sehingga akses paksa via URL tetap diblok dan diarahkan ke `/unauthorized`.

## Insight Engine

Setiap chart di dashboard punya `InsightCard` di bawahnya. Insight dihitung di frontend lewat `src/utils/dashboardInsight.ts` dari data response dashboard:

- `generateRevenueInsight`
- `generateProfitInsight`
- `generateExpenseInsight`
- `generateProductInsight`
- `generateCategoryInsight`
- `generateRevenueVsExpenseInsight`
- `generateOverallInsight`

Setiap insight memiliki Ringkasan, Analisis, Dampak, dan Rekomendasi.

## Charts

- Revenue trend line chart
- Product revenue bar chart
- Category donut chart
- Profit area chart
- Expense breakdown horizontal bar chart
- Revenue vs expense comparison chart
- Top products ranking chart

## Troubleshooting

Jika data tidak muncul dari API, pastikan backend berjalan dan `VITE_API_BASE_URL` benar.

Jika ECharts tidak terlihat setelah resize browser, refresh halaman dan cek console browser.

Jika Playwright belum punya browser, jalankan:

```powershell
npx playwright install
```

## Roadmap

- Pagination dan server-side filtering untuk CRUD tables
- Date range picker dengan preset
- Export chart ke PNG
- Export table ke CSV
- Refresh token rotation
- Saved dashboard filters
- Deployment ke cloud hosting

## Screenshot Placeholder

Tambahkan screenshot dashboard desktop, mobile, dark mode, dan management page setelah aplikasi berjalan lokal.
