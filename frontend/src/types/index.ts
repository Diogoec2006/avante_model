export type Role = 'ADMIN' | 'VENDEDOR' | 'CONTADOR' | 'ASISTENTE_BODEGA';

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
  phone?: string;
  document_number?: string;
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
  cost_price?: number; // Oculto a Vendedor y Asistente de Bodega
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
  assigned_seller_id?: string;
  assigned_seller_name?: string;
  handoff_notes?: string;
  is_exclusive?: boolean;
}

export type AuditPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL';

export interface ProductDemandHeat {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
  unitsRequested: number;
  transactionsCount: number;
  demandVelocity: number; // 0 a 100
  heatLevel: 'CRITICAL_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  depletionDays: number;
  revenueGeneratedUSD: number;
}

export interface AuditReportData {
  period: AuditPeriod;
  periodLabel: string;
  generatedAt: string;
  sriAuthorizationCode: string;
  auditorName: string;
  companyName: string;
  companyRuc: string;
  metrics: {
    totalSalesUSD: number;
    subtotalUSD: number;
    iva15SRIUSD: number;
    cashUSD: number;
    transferUSD: number;
    cardUSD: number;
    creditUSD: number;
    invoicesCount: number;
    creditCollectedUSD: number;
    receivablesOverdueUSD: number;
    costOfGoodsUSD: number;
    estimatedGrossProfitUSD: number;
  };
  transactionsBreakdown: {
    reference: string;
    description: string;
    paymentMethod: string;
    subtotal: number;
    tax: number;
    total: number;
    status: string;
  }[];
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
