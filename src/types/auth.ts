export type Role = "USER" | "MANAGER" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: UserStatus;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role?: Role;
  status?: UserStatus;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
};
