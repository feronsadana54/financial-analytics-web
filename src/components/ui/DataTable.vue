<template>
  <div class="data-table">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :style="column.width ? { width: column.width } : undefined">{{ column.label }}</th>
            <th v-if="$slots.actions" class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)">
              <div class="table-empty">{{ emptyMessage }}</div>
            </td>
          </tr>
          <tr v-for="(row, index) in rows" :key="rowKey ? row[rowKey] : index">
            <td v-for="column in columns" :key="column.key" :data-label="column.label">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">{{ formatCell(row, column) }}</slot>
            </td>
            <td v-if="$slots.actions" class="actions-cell">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
type Column = {
  key: string;
  label: string;
  width?: string;
  formatter?: (value: unknown, row: T) => string;
};

withDefaults(defineProps<{ columns: Column[]; rows: T[]; rowKey?: string; emptyMessage?: string }>(), {
  emptyMessage: "No records found"
});

function formatCell(row: T, column: Column) {
  const value = row[column.key];
  if (column.formatter) return column.formatter(value, row);
  if (value === null || value === undefined) return "—";
  return String(value);
}
</script>
