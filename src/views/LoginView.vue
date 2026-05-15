<template>
  <section class="auth-form">
    <h1>Sign in</h1>
    <p class="auth-subtitle">Access your financial analytics workspace.</p>

    <form @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" minlength="6" required />
      </label>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <button type="submit" class="btn-primary block" :disabled="auth.loading">
        {{ auth.loading ? "Signing in..." : "Sign in" }}
      </button>
    </form>

    <div class="auth-footer">
      <p>Don't have an account? <RouterLink to="/register">Create one</RouterLink></p>
    </div>

    <div class="demo-accounts">
      <strong>Demo accounts</strong>
      <ul>
        <li><code>admin@financial.local</code> / <code>Admin12345</code></li>
        <li><code>manager@financial.local</code> / <code>Manager12345</code></li>
        <li><code>user@financial.local</code> / <code>User12345</code></li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { extractErrorMessage } from "../services/api";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    await auth.login({ email: email.value, password: password.value });
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/dashboard";
    await router.push(redirect);
  } catch (err) {
    error.value = extractErrorMessage(err, "Unable to sign in");
  }
}
</script>
