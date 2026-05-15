<template>
  <section class="auth-form">
    <h1>Create account</h1>
    <p class="auth-subtitle">New accounts start with the User role. Super Admin can promote you later.</p>

    <form @submit.prevent="handleSubmit">
      <label>
        Full name
        <input v-model="name" type="text" minlength="2" required />
      </label>
      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="new-password" minlength="6" required />
      </label>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn-primary block" :disabled="auth.loading">
        {{ auth.loading ? "Creating..." : "Create account" }}
      </button>
    </form>

    <div class="auth-footer">
      <p>Already have an account? <RouterLink to="/login">Sign in</RouterLink></p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { extractErrorMessage } from "../services/api";

const auth = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value });
    await router.push("/dashboard");
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to create account");
  }
}
</script>
