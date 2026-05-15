import { deleteData, getData, patchData, postData } from "./api";
import type { CreateSalePayload, Sale, UpdateSalePayload } from "../types/crud";

export function listSales() {
  return getData<Sale[]>("/sales");
}

export function createSale(payload: CreateSalePayload) {
  return postData<Sale>("/sales", payload);
}

export function updateSale(id: string, payload: UpdateSalePayload) {
  return patchData<Sale>(`/sales/${id}`, payload);
}

export function deleteSale(id: string) {
  return deleteData<{ id: string }>(`/sales/${id}`);
}
