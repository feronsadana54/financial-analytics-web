<template>
  <section class="page">
    <PageHeader eyebrow="Access Control" title="User Management" subtitle="Manage workspace members, roles, and access status.">
      <template #actions>
        <button v-if="canCreate" type="button" class="btn-primary" @click="openCreate">+ New user</button>
      </template>
    </PageHeader>

    <FilterBar>
      <label>
        Search
        <input v-model="search" type="search" placeholder="Search name or email" />
      </label>
      <label>
        Role
        <select v-model="roleFilter">
          <option value="">All roles</option>
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </label>
      <label>
        Status
        <select v-model="statusFilter">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </label>
    </FilterBar>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" retry-label="Retry" @retry="load" />
    <EmptyState v-else-if="filtered.length === 0" icon="0" title="No users found" message="Adjust your filters or create a new user." />
    <DataTable v-else :rows="filtered" row-key="id" :columns="columns">
      <template #cell-role="{ row }">
        <RoleBadge :role="row.role" />
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
      <template #actions="{ row }">
        <div class="actions-group">
          <button v-if="canEditTarget(row)" type="button" class="link" @click="openEdit(row)">Edit</button>
          <button v-if="canChangeRole(row)" type="button" class="link" @click="openRole(row)">Role</button>
          <button v-if="canChangeStatus(row)" type="button" class="link" @click="toggleStatus(row)">{{ row.status === "ACTIVE" ? "Deactivate" : "Activate" }}</button>
          <button v-if="canDelete(row)" type="button" class="link danger" @click="confirmDelete(row)">Delete</button>
        </div>
      </template>
    </DataTable>

    <FormModal :open="formOpen" :title="editing ? 'Edit user' : 'Create user'" :submit-label="editing ? 'Update' : 'Create'" :submitting="submitting" @close="closeForm" @submit="submitForm">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label>
        Name
        <input v-model="form.name" type="text" minlength="2" required />
      </label>
      <label>
        Email
        <input v-model="form.email" type="email" required />
      </label>
      <label>
        Password <span v-if="editing" class="muted">(leave empty to keep)</span>
        <input v-model="form.password" type="password" :minlength="editing ? undefined : 6" :required="!editing" autocomplete="new-password" />
      </label>
      <label v-if="!editing">
        Role
        <select v-model="form.role">
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
          <option v-if="auth.role === 'SUPER_ADMIN'" value="SUPER_ADMIN">Super Admin</option>
        </select>
      </label>
    </FormModal>

    <FormModal :open="roleOpen" :title="`Change role · ${selectedUser?.name ?? ''}`" submit-label="Save role" :submitting="submitting" @close="roleOpen = false" @submit="submitRole">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <label>
        Role
        <select v-model="roleValue">
          <option value="USER">User</option>
          <option value="MANAGER">Manager</option>
          <option v-if="auth.role === 'SUPER_ADMIN'" value="SUPER_ADMIN">Super Admin</option>
        </select>
      </label>
    </FormModal>

    <ConfirmDialog
      :open="confirmOpen"
      title="Deactivate user"
      :message="`This will set ${selectedUser?.name ?? 'the account'} to inactive. They will no longer be able to sign in.`"
      confirm-label="Deactivate"
      :loading="submitting"
      @cancel="confirmOpen = false"
      @confirm="performDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import DataTable from "../components/ui/DataTable.vue";
import EmptyState from "../components/ui/EmptyState.vue";
import ErrorState from "../components/ui/ErrorState.vue";
import FilterBar from "../components/ui/FilterBar.vue";
import FormModal from "../components/ui/FormModal.vue";
import ConfirmDialog from "../components/ui/ConfirmDialog.vue";
import LoadingState from "../components/ui/LoadingState.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import RoleBadge from "../components/ui/RoleBadge.vue";
import StatusBadge from "../components/ui/StatusBadge.vue";
import { extractErrorMessage } from "../services/api";
import { createUser, deactivateUser, listUsers, updateUser, updateUserRole, updateUserStatus } from "../services/userService";
import { useAuthStore } from "../stores/auth";
import type { ManagedUser, Role, UserStatus } from "../types/auth";

const auth = useAuthStore();
const users = ref<ManagedUser[]>([]);
const loading = ref(false);
const error = ref("");
const search = ref("");
const roleFilter = ref<"" | Role>("");
const statusFilter = ref<"" | UserStatus>("");

const formOpen = ref(false);
const roleOpen = ref(false);
const confirmOpen = ref(false);
const submitting = ref(false);
const formError = ref("");
const editing = ref<ManagedUser | null>(null);
const selectedUser = ref<ManagedUser | null>(null);
const roleValue = ref<Role>("USER");

const form = reactive({ name: "", email: "", password: "", role: "USER" as Role });

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" }
];

const canCreate = computed(() => auth.role === "SUPER_ADMIN");

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return users.value.filter((user) => {
    if (term && !user.name.toLowerCase().includes(term) && !user.email.toLowerCase().includes(term)) return false;
    if (roleFilter.value && user.role !== roleFilter.value) return false;
    if (statusFilter.value && user.status !== statusFilter.value) return false;
    return true;
  });
});

function canEditTarget(target: ManagedUser) {
  if (auth.role !== "SUPER_ADMIN") return false;
  if (target.role === "SUPER_ADMIN" && auth.user?.id !== target.id) return true;
  return true;
}

function canChangeRole(target: ManagedUser) {
  if (auth.role !== "SUPER_ADMIN") return false;
  if (target.id === auth.user?.id) return false;
  return true;
}

function canChangeStatus(target: ManagedUser) {
  if (auth.role !== "SUPER_ADMIN") return false;
  if (target.id === auth.user?.id) return false;
  return true;
}

function canDelete(target: ManagedUser) {
  if (auth.role !== "SUPER_ADMIN") return false;
  if (target.id === auth.user?.id) return false;
  if (target.status === "INACTIVE") return false;
  return true;
}

function resetForm() {
  form.name = "";
  form.email = "";
  form.password = "";
  form.role = "USER";
  editing.value = null;
  formError.value = "";
}

function openCreate() {
  resetForm();
  formOpen.value = true;
}

function openEdit(target: ManagedUser) {
  resetForm();
  editing.value = target;
  form.name = target.name;
  form.email = target.email;
  form.role = target.role;
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
  resetForm();
}

function openRole(target: ManagedUser) {
  selectedUser.value = target;
  roleValue.value = target.role;
  formError.value = "";
  roleOpen.value = true;
}

function confirmDelete(target: ManagedUser) {
  selectedUser.value = target;
  confirmOpen.value = true;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    users.value = await listUsers();
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to load users");
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  submitting.value = true;
  formError.value = "";
  try {
    if (editing.value) {
      const payload: { name?: string; email?: string; password?: string } = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await updateUser(editing.value.id, payload);
    } else {
      await createUser({ name: form.name, email: form.email, password: form.password, role: form.role });
    }
    closeForm();
    await load();
  } catch (err) {
    formError.value = extractErrorMessage(err, "Unable to save user");
  } finally {
    submitting.value = false;
  }
}

async function submitRole() {
  if (!selectedUser.value) return;
  submitting.value = true;
  formError.value = "";
  try {
    await updateUserRole(selectedUser.value.id, roleValue.value);
    roleOpen.value = false;
    await load();
  } catch (err) {
    formError.value = extractErrorMessage(err, "Unable to update role");
  } finally {
    submitting.value = false;
  }
}

async function toggleStatus(target: ManagedUser) {
  submitting.value = true;
  try {
    await updateUserStatus(target.id, target.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
    await load();
  } finally {
    submitting.value = false;
  }
}

async function performDelete() {
  if (!selectedUser.value) return;
  submitting.value = true;
  try {
    await deactivateUser(selectedUser.value.id);
    confirmOpen.value = false;
    await load();
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
