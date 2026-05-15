<template>
  <section class="page">
    <PageHeader eyebrow="Cost Operations" title="Expenses" subtitle="Capture operational costs by date and category.">
      <template #actions>
        <button v-if="canEdit" type="button" class="btn-primary" @click="openCreate">+ New expense</button>
      </template>
    </PageHeader>

    <FilterBar>
      <label>
        Search
        <input v-model="search" type="search" placeholder="Title or note" />
      </label>
      <label>
        Category
        <select v-model="categoryFilter">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
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
    <EmptyState v-else-if="filtered.length === 0" icon="0" title="No expenses" message="Adjust filters or add a new expense." />
    <DataTable v-else :rows="filtered" row-key="id" :columns="columns">
      <template #cell-expenseDate="{ row }">{{ formatDate(row.expenseDate) }}</template>
      <template #cell-amount="{ row }">{{ formatCurrency(Number(row.amount)) }}</template>
      <template #cell-category="{ row }">{{ row.expenseCategory?.name ?? "—" }}</template>
      <template #actions="{ row }">
        <div v-if="canEdit" class="actions-group">
          <button type="button" class="link" @click="openEdit(row)">Edit</button>
          <button type="button" class="link danger" @click="confirmDelete(row)">Delete</button>
        </div>
      </template>
    </DataTable>

    <FormModal :open="formOpen" :title="editing ? 'Edit expense' : 'Create expense'" :submit-label="editing ? 'Update' : 'Create'" :submitting="submitting" @close="closeForm" @submit="submitForm">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label>
        Title
        <input v-model="form.title" type="text" minlength="2" required />
      </label>
      <div class="grid-2">
        <label>
          Category
          <select v-model="form.expenseCategoryId" required>
            <option value="" disabled>Select category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </label>
        <label>
          Date
          <input v-model="form.expenseDate" type="date" required />
        </label>
      </div>
      <label>
        Amount (IDR)
        <input v-model.number="form.amount" type="number" min="0" step="1000" required />
      </label>
      <label>
        Notes
        <textarea v-model="form.notes" rows="3" />
      </label>
    </FormModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Delete expense"
      :message="`Remove ${selected?.title ?? 'this expense'}?`"
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
import { createExpense, deleteExpense, listExpenseCategories, listExpenses, updateExpense } from "../services/expenseService";
import { useAuthStore } from "../stores/auth";
import type { Expense, ExpenseCategory } from "../types/crud";
import { formatCurrency } from "../utils/formatters";

const auth = useAuthStore();
const items = ref<Expense[]>([]);
const categories = ref<ExpenseCategory[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const categoryFilter = ref("");
const startDate = ref("");
const endDate = ref("");

const formOpen = ref(false);
const confirmOpen = ref(false);
const submitting = ref(false);
const formError = ref("");
const editing = ref<Expense | null>(null);
const selected = ref<Expense | null>(null);

const form = reactive({
  title: "",
  expenseCategoryId: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  amount: 0,
  notes: ""
});

const columns = [
  { key: "expenseDate", label: "Date" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" }
];

const canEdit = computed(() => auth.canManage);

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  const start = startDate.value ? new Date(startDate.value).getTime() : null;
  const end = endDate.value ? new Date(endDate.value).getTime() + 86_400_000 - 1 : null;
  return items.value.filter((item) => {
    if (term && !item.title.toLowerCase().includes(term) && !(item.notes ?? "").toLowerCase().includes(term)) return false;
    if (categoryFilter.value && item.expenseCategoryId !== categoryFilter.value) return false;
    const ts = new Date(item.expenseDate).getTime();
    if (start !== null && ts < start) return false;
    if (end !== null && ts > end) return false;
    return true;
  });
});

function resetForm() {
  form.title = "";
  form.expenseCategoryId = "";
  form.expenseDate = new Date().toISOString().slice(0, 10);
  form.amount = 0;
  form.notes = "";
  editing.value = null;
  formError.value = "";
}

function openCreate() {
  resetForm();
  formOpen.value = true;
}

function openEdit(target: Expense) {
  resetForm();
  editing.value = target;
  form.title = target.title;
  form.expenseCategoryId = target.expenseCategoryId;
  form.expenseDate = new Date(target.expenseDate).toISOString().slice(0, 10);
  form.amount = Number(target.amount);
  form.notes = target.notes ?? "";
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  resetForm();
}

function confirmDelete(target: Expense) {
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
    const [expensesData, categoriesData] = await Promise.all([listExpenses(), listExpenseCategories()]);
    items.value = expensesData;
    categories.value = categoriesData;
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to load expenses");
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  submitting.value = true;
  formError.value = "";
  try {
    const payload = {
      title: form.title,
      expenseCategoryId: form.expenseCategoryId,
      expenseDate: new Date(form.expenseDate).toISOString(),
      amount: Number(form.amount),
      notes: form.notes || undefined
    };
    if (editing.value) {
      await updateExpense(editing.value.id, payload);
    } else {
      await createExpense(payload);
    }
    closeForm();
    await load();
  } catch (err) {
    formError.value = extractErrorMessage(err, "Unable to save expense");
  } finally {
    submitting.value = false;
  }
}

async function performDelete() {
  if (!selected.value) return;
  submitting.value = true;
  try {
    await deleteExpense(selected.value.id);
    confirmOpen.value = false;
    await load();
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
