import { deleteData, getData, patchData, postData } from "./api";
import type { CreateUserPayload, ManagedUser, Role, UpdateUserPayload, UserStatus } from "../types/auth";

export function listUsers() {
  return getData<ManagedUser[]>("/users");
}

export function createUser(payload: CreateUserPayload) {
  return postData<ManagedUser>("/users", payload);
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return patchData<ManagedUser>(`/users/${id}`, payload);
}

export function updateUserRole(id: string, role: Role) {
  return patchData<ManagedUser>(`/users/${id}/role`, { role });
}

export function updateUserStatus(id: string, status: UserStatus) {
  return patchData<ManagedUser>(`/users/${id}/status`, { status });
}

export function deactivateUser(id: string) {
  return deleteData<ManagedUser>(`/users/${id}`);
}
