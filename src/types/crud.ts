export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  expenseCategoryId: string;
  expenseCategory?: ExpenseCategory;
  expenseDate: string;
  title: string;
  amount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SaleItem = {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice?: number;
  unitCost?: number;
  subtotal?: number;
  profit?: number;
};

export type Sale = {
  id: string;
  transactionDate: string;
  customerName: string;
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryPayload = { name: string; description?: string };
export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CreateProductPayload = {
  categoryId: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
};
export type UpdateProductPayload = Partial<CreateProductPayload>;

export type CreateExpensePayload = {
  expenseCategoryId: string;
  expenseDate: string;
  title: string;
  amount: number;
  notes?: string;
};
export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export type CreateSalePayload = {
  transactionDate: string;
  customerName: string;
  items: { productId: string; quantity: number }[];
};
export type UpdateSalePayload = Partial<CreateSalePayload>;
