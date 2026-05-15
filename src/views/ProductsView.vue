<template>
  <section class="page">
    <PageHeader eyebrow="Catalog Management" title="Products" subtitle="Manage product SKUs, pricing, and stock.">
      <template #actions>
        <button v-if="canEdit" type="button" class="btn-primary" @click="openCreate">+ New product</button>
      </template>
    </PageHeader>

    <FilterBar>
      <label>
        Search
        <input v-model="search" type="search" placeholder="Search name or SKU" />
      </label>
      <label>
        Category
        <select v-model="categoryFilter">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </label>
    </FilterBar>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" retry-label="Retry" @retry="load" />
    <EmptyState v-else-if="filtered.length === 0" icon="0" title="No products" message="Adjust filters or add a new product." />
    <DataTable v-else :rows="filtered" row-key="id" :columns="columns">
      <template #cell-price="{ row }">{{ formatCurrency(Number(row.price)) }}</template>
      <template #cell-cost="{ row }">{{ formatCurrency(Number(row.cost)) }}</template>
      <template #cell-category="{ row }">{{ row.category?.name ?? "—" }}</template>
      <template #actions="{ row }">
        <div v-if="canEdit" class="actions-group">
          <button type="button" class="link" @click="openEdit(row)">Edit</button>
          <button type="button" class="link danger" @click="confirmDelete(row)">Delete</button>
        </div>
      </template>
    </DataTable>

    <FormModal :open="formOpen" :title="editing ? 'Edit product' : 'Create product'" :submit-label="editing ? 'Update' : 'Create'" :submitting="submitting" @close="closeForm" @submit="submitForm">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label>
        Name
        <input v-model="form.name" type="text" minlength="2" required />
      </label>
      <label>
        SKU
        <input v-model="form.sku" type="text" minlength="2" required />
      </label>
      <label>
        Category
        <select v-model="form.categoryId" required>
          <option value="" disabled>Select category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </label>
      <div class="grid-2">
        <label>
          Price (IDR)
          <input v-model.number="form.price" type="number" min="0" step="1000" required />
        </label>
        <label>
          Cost (IDR)
          <input v-model.number="form.cost" type="number" min="0" step="1000" required />
        </label>
      </div>
      <label>
        Stock
        <input v-model.number="form.stock" type="number" min="0" step="1" required />
      </label>
    </FormModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Delete product"
      :message="`Permanently remove ${selected?.name ?? 'this product'}?`"
      confirm-label="Delete"
      :loading="submitting"
      @cancel="confirmOpen = false"
      @confirm="performDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import ConfirmDialog from "../components/ui/ConfirmDialog.vue";
import DataTable from "../components/ui/DataTable.vue";
import EmptyState from "../components/ui/EmptyState.vue";
import ErrorState from "../components/ui/ErrorState.vue";
import FilterBar from "../components/ui/FilterBar.vue";
import FormModal from "../components/ui/FormModal.vue";
import LoadingState from "../components/ui/LoadingState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import { extractErrorMessage } from "../services/api";
import { listCategories } from "../services/categoryService";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../services/productService";
import { useAuthStore } from "../stores/auth";
import type { Category, Product } from "../types/crud";
import { formatCurrency } from "../utils/formatters";

const auth = useAuthStore();
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const categoryFilter = ref("");

const formOpen = ref(false);
const confirmOpen = ref(false);
const submitting = ref(false);
const formError = ref("");
const editing = ref<Product | null>(null);
const selected = ref<Product | null>(null);

const form = reactive({ name: "", sku: "", categoryId: "", price: 0, cost: 0, stock: 0 });

const columns = [
  { key: "name", label: "Name" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "cost", label: "Cost" },
  { key: "stock", label: "Stock" }
];

const canEdit = computed(() => auth.canManage);

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return products.value.filter((item) => {
    if (term && !item.name.toLowerCase().includes(term) && !item.sku.toLowerCase().includes(term)) return false;
    if (categoryFilter.value && item.categoryId !== categoryFilter.value) return false;
    return true;
  });
});

function resetForm() {
  form.name = "";
  form.sku = "";
  form.categoryId = "";
  form.price = 0;
  form.cost = 0;
  form.stock = 0;
  editing.value = null;
  formError.value = "";
}

function openCreate() {
  resetForm();
  formOpen.value = true;
}

function openEdit(target: Product) {
  resetForm();
  editing.value = target;
  form.name = target.name;
  form.sku = target.sku;
  form.categoryId = target.categoryId;
  form.price = Number(target.price);
  form.cost = Number(target.cost);
  form.stock = Number(target.stock);
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  resetForm();
}

function confirmDelete(target: Product) {
  selected.value = target;
  confirmOpen.value = true;
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [productsData, categoriesData] = await Promise.all([listProducts(), listCategories()]);
    products.value = productsData;
    categories.value = categoriesData;
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to load products");
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  submitting.value = true;
  formError.value = "";
  try {
    const payload = {
      name: form.name,
      sku: form.sku,
      categoryId: form.categoryId,
      price: Number(form.price),
      cost: Number(form.cost),
      stock: Number(form.stock)
    };
    if (editing.value) {
      await updateProduct(editing.value.id, payload);
    } else {
      await createProduct(payload);
    }
    closeForm();
    await load();
  } catch (err) {
    formError.value = extractErrorMessage(err, "Unable to save product");
  } finally {
    submitting.value = false;
  }
}

async function performDelete() {
  if (!selected.value) return;
  submitting.value = true;
  try {
    await deleteProduct(selected.value.id);
    confirmOpen.value = false;
    await load();
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
