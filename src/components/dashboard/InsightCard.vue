<template>
  <section class="insight-card" :class="`tone-${insight.tone}`">
    <header>
      <span class="insight-eyebrow">Insight · {{ heading }}</span>
    </header>
    <dl>
      <div>
        <dt>Ringkasan</dt>
        <dd>{{ insight.summary }}</dd>
      </div>
      <div>
        <dt>Analisis</dt>
        <dd>{{ insight.analysis }}</dd>
      </div>
      <div>
        <dt>Dampak</dt>
        <dd>{{ insight.impact }}</dd>
      </div>
      <div>
        <dt>Rekomendasi</dt>
        <dd>{{ insight.recommendation }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { Insight } from "../../utils/dashboardInsight";

defineProps<{ heading: string; insight: Insight }>();
</script>
