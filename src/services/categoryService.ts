import { deleteData, getData, patchData, postData } from "./api";
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "../types/crud";

export function listCategories() {
  return getData<Category[]>("/categories");
}

export function createCategory(payload: CreateCategoryPayload) {
  return postData<Category>("/categories", payload);
}

export function updateCategory(id: string, payload: UpdateCategoryPayload) {
  return patchData<Category>(`/categories/${id}`, payload);
}

export function deleteCategory(id: string) {
  return deleteData<{ id: string }>(`/categories/${id}`);
}
