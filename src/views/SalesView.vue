<template>
  <section class="page">
    <PageHeader eyebrow="Revenue Operations" title="Sales Transactions" subtitle="Record customer orders and their product line items.">
      <template #actions>
        <button v-if="canCreate" type="button" class="btn-primary" @click="openCreate">+ New sale</button>
      </template>
    </PageHeader>

    <FilterBar>
      <label>
        Search
        <input v-model="search" type="search" placeholder="Customer name" />
      </label>
      <label>
        From
        <input v-model="startDate" type="date" />
      </label>
      <label>
        To
        <input v-model="endDate" type="date" />
      </label>
    </FilterBar>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" retry-label="Retry" @retry="load" />
    <EmptyState v-else-if="filtered.length === 0" icon="0" title="No sales" message="Adjust filters or create a new transaction." />
    <DataTable v-else :rows="filtered" row-key="id" :columns="columns">
      <template #cell-transactionDate="{ row }">{{ formatDate(row.transactionDate) }}</template>
      <template #cell-totalAmount="{ row }">{{ formatCurrency(Number(row.totalAmount)) }}</template>
      <template #cell-grossProfit="{ row }">{{ formatCurrency(Number(row.grossProfit)) }}</template>
      <template #cell-itemsCount="{ row }">{{ row.items?.length ?? 0 }}</template>
      <template #actions="{ row }">
        <div class="actions-group">
          <button v-if="canEditTarget" type="button" class="link" @click="openEdit(row)">Edit</button>
          <button v-if="canDelete" type="button" class="link danger" @click="confirmDelete(row)">Delete</button>
        </div>
      </template>
    </DataTable>

    <FormModal :open="formOpen" :title="editing ? 'Edit sale' : 'Create sale'" :submit-label="editing ? 'Update' : 'Create'" :submitting="submitting" @close="closeForm" @submit="submitForm">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <div class="grid-2">
        <label>
          Customer
          <input v-model="form.customerName" type="text" required />
        </label>
        <label>
          Transaction date
          <input v-model="form.transactionDate" type="date" required />
        </label>
      </div>

      <div class="items-block">
        <div class="items-header">
          <h4>Items</h4>
          <button type="button" class="link" @click="addItem">+ Add item</button>
        </div>
        <p v-if="form.items.length === 0" class="muted">At least one item is required.</p>
        <div v-for="(item, index) in form.items" :key="index" class="item-row">
          <select v-model="item.productId" required>
            <option value="" disabled>Select product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} · {{ formatCurrency(Number(product.price)) }}</option>
          </select>
          <input v-model.number="item.quantity" type="number" min="1" step="1" required />
          <span class="item-subtotal">{{ formatCurrency(itemSubtotal(item)) }}</span>
          <button type="button" class="link danger" @click="removeItem(index)">Remove</button>
        </div>
        <p v-if="form.items.length > 0" class="items-total">Total: {{ formatCurrency(totalAmount) }}</p>
      </div>
    </FormModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Delete sale"
      :message="`Remove sale for ${selected?.customerName ?? 'this customer'}?`"
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
import { listProducts } from "../services/productService";
import { createSale, deleteSale, listSales, updateSale } from "../services/salesService";
import { useAuthStore } from "../stores/auth";
import type { Product, Sale } from "../types/crud";
import { formatCurrency } from "../utils/formatters";

const auth = useAuthStore();
const items = ref<Sale[]>([]);
const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const startDate = ref("");
const endDate = ref("");

const formOpen = ref(false);
const confirmOpen = ref(false);
const submitting = ref(false);
const formError = ref("");
const editing = ref<Sale | null>(null);
const selected = ref<Sale | null>(null);

const form = reactive<{
  customerName: string;
  transactionDate: string;
  items: { productId: string; quantity: number }[];
}>({ customerName: "", transactionDate: new Date().toISOString().slice(0, 10), items: [] });

const columns = [
  { key: "transactionDate", label: "Date" },
  { key: "customerName", label: "Customer" },
  { key: "itemsCount", label: "Items" },
  { key: "totalAmount", label: "Total" },
  { key: "grossProfit", label: "Profit" }
];

const canCreate = computed(() => Boolean(auth.user));
const canEditTarget = computed(() => auth.canManage);
const canDelete = computed(() => auth.canManage);

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  const start = startDate.value ? new Date(startDate.value).getTime() : null;
  const end = endDate.value ? new Date(endDate.value).getTime() + 86_400_000 - 1 : null;
  return items.value.filter((item) => {
    if (term && !item.customerName.toLowerCase().includes(term)) return false;
    const ts = new Date(item.transactionDate).getTime();
    if (start !== null && ts < start) return false;
    if (end !== null && ts > end) return false;
    return true;
  });
});

const totalAmount = computed(() => form.items.reduce((sum, item) => sum + itemSubtotal(item), 0));

function itemSubtotal(item: { productId: string; quantity: number }) {
  const product = products.value.find((entry) => entry.id === item.productId);
  if (!product) return 0;
  return Number(product.price) * (Number(item.quantity) || 0);
}

function addItem() {
  form.items.push({ productId: "", quantity: 1 });
}

function removeItem(index: number) {
  form.items.splice(index, 1);
}

function resetForm() {
  form.customerName = "";
  form.transactionDate = new Date().toISOString().slice(0, 10);
  form.items = [];
  editing.value = null;
  formError.value = "";
}

function openCreate() {
  resetForm();
  addItem();
  formOpen.value = true;
}

function openEdit(target: Sale) {
  resetForm();
  editing.value = target;
  form.customerName = target.customerName;
  form.transactionDate = new Date(target.transactionDate).toISOString().slice(0, 10);
  form.items = target.items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  resetForm();
}

function confirmDelete(target: Sale) {
  selected.value = target;
  confirmOpen.value = true;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [salesData, productsData] = await Promise.all([listSales(), listProducts()]);
    items.value = salesData;
    products.value = productsData;
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to load sales");
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  if (form.items.length === 0 || form.items.some((item) => !item.productId)) {
    formError.value = "Add at least one item with a selected product";
    return;
  }
  submitting.value = true;
  formError.value = "";
  try {
    const payload = {
      transactionDate: new Date(form.transactionDate).toISOString(),
      customerName: form.customerName,
      items: form.items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) }))
    };
    if (editing.value) {
      await updateSale(editing.value.id, payload);
    } else {
      await createSale(payload);
    }
    closeForm();
    await load();
  } catch (err) {
    formError.value = extractErrorMessage(err, "Unable to save sale");
  } finally {
    submitting.value = false;
  }
}

async function performDelete() {
  if (!selected.value) return;
  submitting.value = true;
  try {
    await deleteSale(selected.value.id);
    confirmOpen.value = false;
    await load();
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
