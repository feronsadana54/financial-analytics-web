<template>
  <section class="centered-state">
    <div class="state-icon error" aria-hidden="true">!</div>
    <h1>Access restricted</h1>
    <p>You do not have permission to view this page. Contact a Super Admin if you believe this is a mistake.</p>
    <div class="centered-actions">
      <RouterLink to="/dashboard" class="btn-primary">Back to dashboard</RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
