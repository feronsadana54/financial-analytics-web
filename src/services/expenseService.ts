import { deleteData, getData, patchData, postData } from "./api";
import type { CreateExpensePayload, Expense, ExpenseCategory, UpdateExpensePayload } from "../types/crud";

export function listExpenses() {
  return getData<Expense[]>("/expenses");
}

export function listExpenseCategories() {
  return getData<ExpenseCategory[]>("/expenses/categories");
}

export function createExpense(payload: CreateExpensePayload) {
  return postData<Expense>("/expenses", payload);
}

export function updateExpense(id: string, payload: UpdateExpensePayload) {
  return patchData<Expense>(`/expenses/${id}`, payload);
}

export function deleteExpense(id: string) {
  return deleteData<{ id: string }>(`/expenses/${id}`);
}
