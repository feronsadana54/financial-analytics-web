<template>
  <section class="page">
    <PageHeader eyebrow="Catalog Management" title="Categories" subtitle="Organize products into logical revenue groups.">
      <template #actions>
        <button v-if="canEdit" type="button" class="btn-primary" @click="openCreate">+ New category</button>
      </template>
    </PageHeader>

    <FilterBar>
      <label>
        Search
        <input v-model="search" type="search" placeholder="Search name" />
      </label>
    </FilterBar>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" retry-label="Retry" @retry="load" />
    <EmptyState v-else-if="filtered.length === 0" icon="0" title="No categories" message="Create a category to organize products." />
    <DataTable v-else :rows="filtered" row-key="id" :columns="columns">
      <template #actions="{ row }">
        <div v-if="canEdit" class="actions-group">
          <button type="button" class="link" @click="openEdit(row)">Edit</button>
          <button type="button" class="link danger" @click="confirmDelete(row)">Delete</button>
        </div>
      </template>
    </DataTable>

    <FormModal :open="formOpen" :title="editing ? 'Edit category' : 'Create category'" :submit-label="editing ? 'Update' : 'Create'" :submitting="submitting" @close="closeForm" @submit="submitForm">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label>
        Name
        <input v-model="form.name" type="text" minlength="2" required />
      </label>
      <label>
        Description
        <textarea v-model="form.description" rows="3" />
      </label>
    </FormModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Delete category"
      :message="`Permanently remove ${selected?.name ?? 'this category'}? Categories used by products cannot be removed.`"
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
import { createCategory, deleteCategory, listCategories, updateCategory } from "../services/categoryService";
import { useAuthStore } from "../stores/auth";
import type { Category } from "../types/crud";

const auth = useAuthStore();
const items = ref<Category[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");

const formOpen = ref(false);
const confirmOpen = ref(false);
const submitting = ref(false);
const formError = ref("");
const editing = ref<Category | null>(null);
const selected = ref<Category | null>(null);

const form = reactive({ name: "", description: "" });

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" }
];

const canEdit = computed(() => auth.canManage);

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return items.value;
  return items.value.filter((item) => item.name.toLowerCase().includes(term));
});

function resetForm() {
  form.name = "";
  form.description = "";
  editing.value = null;
  formError.value = "";
}

function openCreate() {
  resetForm();
  formOpen.value = true;
}

function openEdit(target: Category) {
  resetForm();
  editing.value = target;
  form.name = target.name;
  form.description = target.description ?? "";
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  resetForm();
}

function confirmDelete(target: Category) {
  selected.value = target;
  confirmOpen.value = true;
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    items.value = await listCategories();
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to load categories");
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  submitting.value = true;
  formError.value = "";
  try {
    const payload = { name: form.name, description: form.description || undefined };
    if (editing.value) {
      await updateCategory(editing.value.id, payload);
    } else {
      await createCategory(payload);
    }
    closeForm();
    await load();
  } catch (err) {
    formError.value = extractErrorMessage(err, "Unable to save category");
  } finally {
    submitting.value = false;
  }
}

async function performDelete() {
  if (!selected.value) return;
  submitting.value = true;
  try {
    await deleteCategory(selected.value.id);
    confirmOpen.value = false;
    await load();
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to delete category");
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
