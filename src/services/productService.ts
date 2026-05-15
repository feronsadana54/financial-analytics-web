import { deleteData, getData, patchData, postData } from "./api";
import type { CreateProductPayload, Product, UpdateProductPayload } from "../types/crud";

export function listProducts() {
  return getData<Product[]>("/products");
}

export function createProduct(payload: CreateProductPayload) {
  return postData<Product>("/products", payload);
}

export function updateProduct(id: string, payload: UpdateProductPayload) {
  return patchData<Product>(`/products/${id}`, payload);
}

export function deleteProduct(id: string) {
  return deleteData<{ id: string }>(`/products/${id}`);
}
