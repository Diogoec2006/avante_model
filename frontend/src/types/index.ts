export type Role = 'ADMIN' | 'VENDEDOR' | 'CONTADOR';

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  CREDIT = 'CREDIT',
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active?: boolean;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  category_id: string;
  category?: Category;
  sku: string;
  barcode: string;
  name: string;
  unit_of_measure: string;
  cost_price?: number; // Oculto a Vendedor
  sale_price: number;
  current_stock: number;
  min_stock: number;
  tax_rate: number;
  is_active: boolean;
}

export interface Customer {
  id: string;
  document_type: string;
  document_number: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  credit_limit: number;
  current_debt: number;
  credit_status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface InvoiceItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer: Customer;
  user_id: string;
  user: User;
  payment_type: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  status: string;
  electronic_sync_status: string;
  fiscal_uuid?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface ReceivableAccount {
  id: string;
  invoice_id: string;
  invoice?: Invoice;
  customer_id: string;
  customer?: Customer;
  total_amount: number;
  balance: number;
  due_date: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  daysOverdue?: number;
  bucket?: string;
}

export interface CreditPayment {
  id: string;
  receipt_number: string;
  amount: number;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export interface AccountingAccount {
  id: string;
  code: string;
  name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  level: number;
  allows_movement: boolean;
}

export interface JournalEntryLine {
  id: string;
  account: AccountingAccount;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  concept: string;
  source_module: string;
  user?: User;
  lines: JournalEntryLine[];
  created_at: string;
}
