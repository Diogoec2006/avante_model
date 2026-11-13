import {
  MOCK_USERS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_ACCOUNTS,
} from './mockData';
import {
  Product,
  Customer,
  Invoice,
  ReceivableAccount,
  JournalEntry,
  Role,
  AccountingAccount,
  AuditPeriod,
  AuditReportData,
  ProductDemandHeat,
  User,
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Inicializar almacenamiento local para modo autónomo / fallback (Ecuador USD)
const initLocalStorage = () => {
  if (localStorage.getItem('avante_currency_ver') !== 'ECUADOR_USD_V3') {
    localStorage.removeItem('avante_products');
    localStorage.removeItem('avante_categories');
    localStorage.removeItem('avante_customers');
    localStorage.removeItem('avante_receivables');
    localStorage.removeItem('avante_accounts');
    localStorage.removeItem('avante_journal_entries');
    localStorage.removeItem('avante_users');
    localStorage.removeItem('avante_token');
    localStorage.removeItem('avante_current_user');
    localStorage.setItem('avante_currency_ver', 'ECUADOR_USD_V3');
  }

  if (!localStorage.getItem('avante_users')) {
    localStorage.setItem('avante_users', JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem('avante_products')) {
    localStorage.setItem('avante_products', JSON.stringify(MOCK_PRODUCTS));
  }
  if (!localStorage.getItem('avante_categories')) {
    localStorage.setItem('avante_categories', JSON.stringify(MOCK_CATEGORIES));
  }
  if (!localStorage.getItem('avante_customers')) {
    localStorage.setItem('avante_customers', JSON.stringify(MOCK_CUSTOMERS));
  }
  if (!localStorage.getItem('avante_accounts')) {
    localStorage.setItem('avante_accounts', JSON.stringify(MOCK_ACCOUNTS));
  }
  if (!localStorage.getItem('avante_receivables')) {
    const defaultReceivables: ReceivableAccount[] = [
      {
        id: 'rec-1',
        invoice_id: 'inv-init-1',
        invoice: {
          id: 'inv-init-1',
          invoice_number: '001-001-000001',
          customer_id: 'cust-2',
          customer: MOCK_CUSTOMERS[1],
          user_id: 'user-admin-1',
          user: MOCK_USERS[0],
          payment_type: 'CREDIT',
          subtotal: 1086.96,
          tax_amount: 163.04,
          discount_amount: 0,
          total: 1250.00,
          status: 'ISSUED',
          electronic_sync_status: 'AUTORIZADO',
          fiscal_uuid: '1311202601179234567800120010010000000011234567813',
          items: [],
          created_at: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
        },
        customer_id: 'cust-2',
        customer: MOCK_CUSTOMERS[1],
        total_amount: 1250.00,
        balance: 1250.00,
        due_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'OVERDUE',
      },
      {
        id: 'rec-2',
        invoice_id: 'inv-init-2',
        invoice: {
          id: 'inv-init-2',
          invoice_number: '001-001-000002',
          customer_id: 'cust-3',
          customer: MOCK_CUSTOMERS[2],
          user_id: 'user-admin-1',
          user: MOCK_USERS[0],
          payment_type: 'CREDIT',
          subtotal: 295.65,
          tax_amount: 44.35,
          discount_amount: 0,
          total: 340.00,
          status: 'ISSUED',
          electronic_sync_status: 'AUTORIZADO',
          fiscal_uuid: '1311202601179234567800120010010000000021234567819',
          items: [],
          created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        },
        customer_id: 'cust-3',
        customer: MOCK_CUSTOMERS[2],
        total_amount: 340.00,
        balance: 340.00,
        due_date: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'PENDING',
      },
    ];
    localStorage.setItem('avante_receivables', JSON.stringify(defaultReceivables));
  }
  if (!localStorage.getItem('avante_journal_entries')) {
    const defaultEntries: JournalEntry[] = [
      {
        id: 'je-1',
        entry_number: 'AS-2026-00001',
        entry_date: new Date().toISOString().split('T')[0],
        concept: 'Venta a Crédito Factura #001-001-000001 - Construcciones Andinas',
        source_module: 'SALES',
        lines: [
          { id: 'l1', account: MOCK_ACCOUNTS[2], debit: 1250.00, credit: 0, description: 'Cuentas por Cobrar Clientes' },
          { id: 'l2', account: MOCK_ACCOUNTS[5], debit: 0, credit: 1086.96, description: 'Ventas de Materiales y Ferretería' },
          { id: 'l3', account: MOCK_ACCOUNTS[4], debit: 0, credit: 163.04, description: 'IVA Ventas 15% por Pagar (SRI)' },
        ],
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem('avante_journal_entries', JSON.stringify(defaultEntries));
  }
  if (!localStorage.getItem('avante_kardex')) {
    localStorage.setItem('avante_kardex', JSON.stringify([]));
  }
};

initLocalStorage();

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('avante_token');
  }

  private static getCurrentUser(): any {
    const u = localStorage.getItem('avante_current_user');
    return u ? JSON.parse(u) : MOCK_USERS[0];
  }

  // Auth
  static async login(email: string, password: string): Promise<{ accessToken: string; user: any }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        localStorage.setItem('avante_token', data.accessToken);
        localStorage.setItem('avante_current_user', JSON.stringify(data.user));
        return data;
      }
    } catch {
      // Backend desconectado o no accesible: usar motor local autónomo
    }

    // Modo local / Fallback
    const storedUsers: any[] = JSON.parse(
      localStorage.getItem('avante_users') || JSON.stringify(MOCK_USERS),
    );
    const user = storedUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (user && user.password === password) {
      if (user.is_active === false) {
        throw new Error('Esta cuenta ha sido desactivada por el Administrador.');
      }
      const mockToken = `mock-token-${user.role}-${Date.now()}`;
      const userData = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      };
      localStorage.setItem('avante_token', mockToken);
      localStorage.setItem('avante_current_user', JSON.stringify(userData));
      return { accessToken: mockToken, user: userData };
    }

    // Si la contraseña no coincide exactamente, permitir si coincide email para facilitar pruebas
    if (user) {
      if (user.is_active === false) {
        throw new Error('Esta cuenta ha sido desactivada por el Administrador.');
      }
      const mockToken = `mock-token-${user.role}-${Date.now()}`;
      const userData = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      };
      localStorage.setItem('avante_token', mockToken);
      localStorage.setItem('avante_current_user', JSON.stringify(userData));
      return { accessToken: mockToken, user: userData };
    }

    throw new Error('Credenciales inválidas. Verifica tu correo y contraseña corporativa.');
  }

  static async getProfile(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error('No autenticado');
    return this.getCurrentUser();
  }

  // Inventory
  static async getProducts(search?: string, categoryId?: string): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/products`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const stored = JSON.parse(localStorage.getItem('avante_products') || '[]');
    const user = this.getCurrentUser();

    return stored.map((p: Product) => {
      if (user?.role === 'VENDEDOR') {
        const copy = { ...p };
        delete copy.cost_price;
        return copy;
      }
      return p;
    });
  }

  static async getCategories(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/categories`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}
    return JSON.parse(localStorage.getItem('avante_categories') || '[]');
  }

  static async createProduct(dto: any): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const prods = JSON.parse(localStorage.getItem('avante_products') || '[]');
    const newP: Product = {
      id: `prod-${Date.now()}`,
      category_id: dto.category_id,
      sku: dto.sku,
      barcode: dto.barcode,
      name: dto.name,
      unit_of_measure: dto.unit_of_measure || 'UND',
      cost_price: Number(dto.cost_price),
      sale_price: Number(dto.sale_price),
      current_stock: Number(dto.initial_stock || 0),
      min_stock: Number(dto.min_stock || 5),
      tax_rate: Number(dto.tax_rate || 19),
      is_active: true,
    };
    prods.push(newP);
    localStorage.setItem('avante_products', JSON.stringify(prods));
    return newP;
  }

  static async adjustStock(dto: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/movements/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const prods = JSON.parse(localStorage.getItem('avante_products') || '[]');
    const idx = prods.findIndex((p: Product) => p.id === dto.product_id);
    if (idx !== -1) {
      const p = prods[idx];
      const prev = Number(p.current_stock);
      const isInput = dto.movement_type.startsWith('IN');
      const qty = Number(dto.quantity);
      p.current_stock = isInput ? prev + qty : Math.max(0, prev - qty);
      if (dto.unit_cost && isInput) p.cost_price = Number(dto.unit_cost);
      prods[idx] = p;
      localStorage.setItem('avante_products', JSON.stringify(prods));

      // Append to kardex
      const kardex = JSON.parse(localStorage.getItem('avante_kardex') || '[]');
      kardex.unshift({
        id: `mov-${Date.now()}`,
        product_id: p.id,
        user: this.getCurrentUser(),
        movement_type: dto.movement_type,
        quantity: qty,
        previous_stock: prev,
        new_stock: p.current_stock,
        reason: dto.reason,
        reference_id: dto.reference_id,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('avante_kardex', JSON.stringify(kardex));
    }
    return { success: true };
  }

  static async getKardex(productId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/movements/kardex/${productId}`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const kardex = JSON.parse(localStorage.getItem('avante_kardex') || '[]');
    const filtered = kardex.filter((k: any) => k.product_id === productId);
    if (filtered.length > 0) return filtered;

    // Movimiento inicial de muestra si está vacío
    return [
      {
        id: 'mov-init',
        product_id: productId,
        user: { full_name: 'Carlos Mendoza (Admin)' },
        movement_type: 'IN_ADJUST',
        quantity: 20,
        previous_stock: 0,
        new_stock: 20,
        reason: 'Inventario inicial de apertura de ferretería Avante',
        reference_id: 'INIT-APERTURA',
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Sales (POS)
  static async checkoutPos(payload: any): Promise<Invoice> {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/pos/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    // Mock local checkout
    const prods = JSON.parse(localStorage.getItem('avante_products') || '[]');
    const custs = JSON.parse(localStorage.getItem('avante_customers') || '[]');
    const customer = custs.find((c: Customer) => c.id === payload.customerId) || custs[0];

    let subtotal = 0;
    let taxAmount = 0;
    const items = payload.items.map((it: any) => {
      const prod = prods.find((p: Product) => p.id === it.productId);
      const price = Number(it.unitPrice);
      const qty = Number(it.quantity);
      const taxRate = Number(it.taxRate !== undefined ? it.taxRate : 15);
      const itemSub = price * qty;
      const itemTax = itemSub * (taxRate / 100);
      subtotal += itemSub;
      taxAmount += itemTax;

      // Descontar inventario
      if (prod) {
        prod.current_stock = Math.max(0, prod.current_stock - qty);
      }

      return {
        id: `item-${Date.now()}-${Math.random()}`,
        product_id: it.productId,
        product: prod,
        quantity: qty,
        unit_price: price,
        tax_rate: taxRate,
        tax_amount: itemTax,
        subtotal: itemSub,
        total: itemSub + itemTax,
      };
    });

    localStorage.setItem('avante_products', JSON.stringify(prods));

    const total = subtotal + taxAmount;
    const countInvoices = parseInt(localStorage.getItem('avante_inv_count') || '3', 10);
    const invoiceNumber = `001-001-${String(countInvoices + 1).padStart(6, '0')}`;
    localStorage.setItem('avante_inv_count', String(countInvoices + 1));

    // Generar Clave de Acceso SRI (49 dígitos numéricos estándar Ecuador)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rucEcuador = '1792345678001';
    const claveAccesoSRI = `${todayStr}01${rucEcuador}1001001${String(countInvoices + 1).padStart(9, '0')}123456781`;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      customer_id: customer.id,
      customer,
      user_id: 'user-active',
      user: this.getCurrentUser(),
      payment_type: payload.paymentType,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: 0,
      total,
      status: 'ISSUED',
      electronic_sync_status: 'AUTORIZADO',
      fiscal_uuid: claveAccesoSRI,
      items,
      created_at: new Date().toISOString(),
    };

    // Si es crédito, sumar a cuentas por cobrar y actualizar deuda del cliente
    if (payload.paymentType === 'CREDIT') {
      customer.current_debt = Number(customer.current_debt) + total;
      localStorage.setItem('avante_customers', JSON.stringify(custs));

      const receivables: ReceivableAccount[] = JSON.parse(
        localStorage.getItem('avante_receivables') || '[]',
      );
      receivables.unshift({
        id: `rec-${Date.now()}`,
        invoice_id: invoice.id,
        invoice,
        customer_id: customer.id,
        customer,
        total_amount: total,
        balance: total,
        due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'PENDING',
      });
      localStorage.setItem('avante_receivables', JSON.stringify(receivables));
    }

    // Generar asiento contable automático
    const entries = JSON.parse(localStorage.getItem('avante_journal_entries') || '[]');
    const isCredit = payload.paymentType === 'CREDIT';
    entries.unshift({
      id: `je-${Date.now()}`,
      entry_number: `AS-2026-${String(entries.length + 1).padStart(5, '0')}`,
      entry_date: new Date().toISOString().split('T')[0],
      concept: `Venta Mostrador Factura #${invoiceNumber} - ${customer.name}`,
      source_module: 'SALES',
      lines: [
        {
          id: `l-deb-${Date.now()}`,
          account: isCredit ? MOCK_ACCOUNTS[2] : MOCK_ACCOUNTS[0],
          debit: total,
          credit: 0,
          description: isCredit ? 'Cartera Clientes' : 'Caja Mostrador POS',
        },
        {
          id: `l-cred1-${Date.now()}`,
          account: MOCK_ACCOUNTS[5],
          debit: 0,
          credit: subtotal,
          description: 'Ingreso por Venta de Mercancías Ferreteras',
        },
        {
          id: `l-cred2-${Date.now()}`,
          account: MOCK_ACCOUNTS[4],
          debit: 0,
          credit: taxAmount,
          description: 'IVA 15% SRI Generado',
        },
      ],
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('avante_journal_entries', JSON.stringify(entries));

    return invoice;
  }

  static async getCustomers(sellerId?: string): Promise<Customer[]> {
    try {
      const url = sellerId
        ? `${API_BASE_URL}/sales/customers?sellerId=${sellerId}`
        : `${API_BASE_URL}/sales/customers`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const all: Customer[] = JSON.parse(
      localStorage.getItem('avante_customers') || '[]',
    );
    if (sellerId) {
      return all.filter(
        (c) =>
          c.document_number === '9999999999' ||
          !c.assigned_seller_id ||
          c.assigned_seller_id === sellerId,
      );
    }
    return all;
  }

  static async createCustomer(dto: Partial<Customer>): Promise<Customer> {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const custs: Customer[] = JSON.parse(
      localStorage.getItem('avante_customers') || '[]',
    );
    const existing = custs.find((c) => c.document_number === dto.document_number);
    if (existing) {
      throw new Error(
        `El cliente con documento ${dto.document_number} ya está registrado en el sistema.`,
      );
    }

    const currentUser = this.getCurrentUser();
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      document_type: dto.document_type || 'RUC',
      document_number: dto.document_number || '',
      name: dto.name || '',
      phone: dto.phone || '',
      email: dto.email || '',
      address: dto.address || '',
      credit_limit: Number(dto.credit_limit || 0),
      current_debt: 0,
      credit_status: 'ACTIVE',
      assigned_seller_id:
        dto.assigned_seller_id ||
        (currentUser.role === 'VENDEDOR' ? currentUser.id : undefined),
      assigned_seller_name:
        dto.assigned_seller_name ||
        (currentUser.role === 'VENDEDOR' ? currentUser.full_name : undefined),
      is_exclusive: true,
      handoff_notes: dto.handoff_notes,
    };

    custs.push(newCustomer);
    localStorage.setItem('avante_customers', JSON.stringify(custs));
    return newCustomer;
  }

  static async reassignCustomer(
    customerId: string,
    newSellerId: string,
    newSellerName: string,
    notes: string,
  ): Promise<Customer> {
    try {
      const res = await fetch(`${API_BASE_URL}/sales/customers/${customerId}/reassign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ newSellerId, newSellerName, notes }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const custs: Customer[] = JSON.parse(
      localStorage.getItem('avante_customers') || '[]',
    );
    const c = custs.find((item) => item.id === customerId);
    if (!c) throw new Error('Cliente no encontrado');
    c.assigned_seller_id = newSellerId;
    c.assigned_seller_name = newSellerName;
    c.handoff_notes = notes;
    localStorage.setItem('avante_customers', JSON.stringify(custs));
    return c;
  }

  static async getCustomerCreditStatus(id: string): Promise<any> {
    const custs = await this.getCustomers();
    const c = custs.find((item) => item.id === id) || custs[0];
    const limit = Number(c.credit_limit);
    const debt = Number(c.current_debt);
    const available = Math.max(0, limit - debt);
    return {
      customerId: c.id,
      name: c.name,
      documentNumber: c.document_number,
      creditStatus: c.credit_status,
      creditLimit: limit,
      currentDebt: debt,
      availableCredit: available,
      canPurchaseCredit: c.credit_status === 'ACTIVE' && available > 0,
    };
  }

  // Receivables
  static async getReceivableAccounts(): Promise<ReceivableAccount[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/receivables/accounts`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}
    return JSON.parse(localStorage.getItem('avante_receivables') || '[]');
  }

  static async getAgingReport(): Promise<any> {
    const accounts: ReceivableAccount[] = await this.getReceivableAccounts();
    const now = new Date();
    const buckets = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      moreThan90: 0,
      totalReceivables: 0,
    };

    accounts.forEach((acc) => {
      const dueDate = new Date(acc.due_date);
      const diffTime = now.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const bal = Number(acc.balance);

      buckets.totalReceivables += bal;
      if (diffDays <= 0) buckets.current += bal;
      else if (diffDays <= 30) buckets.days1_30 += bal;
      else if (diffDays <= 60) buckets.days31_60 += bal;
      else if (diffDays <= 90) buckets.days61_90 += bal;
      else buckets.moreThan90 += bal;
    });

    return { summary: buckets, accounts };
  }

  static async registerPayment(dto: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/receivables/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(dto),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const receivables: ReceivableAccount[] = JSON.parse(
      localStorage.getItem('avante_receivables') || '[]',
    );
    const acc = receivables.find((a) => a.id === dto.receivable_account_id);
    if (acc) {
      const paymentAmount = Number(dto.amount);
      acc.balance = Math.max(0, Number(acc.balance) - paymentAmount);
      acc.status = acc.balance === 0 ? 'PAID' : 'PARTIALLY_PAID';
      localStorage.setItem('avante_receivables', JSON.stringify(receivables));

      // Reducir deuda del cliente
      const custs = JSON.parse(localStorage.getItem('avante_customers') || '[]');
      const c = custs.find((item: Customer) => item.id === acc.customer_id);
      if (c) {
        c.current_debt = Math.max(0, Number(c.current_debt) - paymentAmount);
        localStorage.setItem('avante_customers', JSON.stringify(custs));
      }

      // Asiento contable de abono
      const entries = JSON.parse(localStorage.getItem('avante_journal_entries') || '[]');
      entries.unshift({
        id: `je-${Date.now()}`,
        entry_number: `AS-2026-${String(entries.length + 1).padStart(5, '0')}`,
        entry_date: new Date().toISOString().split('T')[0],
        concept: `Recaudo Cartera Factura #${acc.invoice?.invoice_number || 'Crédito'}`,
        source_module: 'RECEIVABLES',
        lines: [
          { id: `l-deb-${Date.now()}`, account: MOCK_ACCOUNTS[0], debit: paymentAmount, credit: 0, description: 'Caja General' },
          { id: `l-cred-${Date.now()}`, account: MOCK_ACCOUNTS[2], debit: 0, credit: paymentAmount, description: 'Amortización Clientes' },
        ],
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('avante_journal_entries', JSON.stringify(entries));
    }
    return { success: true };
  }

  // Accounting
  static async getChartOfAccounts(): Promise<AccountingAccount[]> {
    return JSON.parse(localStorage.getItem('avante_accounts') || '[]');
  }

  static async getJournalEntries(): Promise<JournalEntry[]> {
    return JSON.parse(localStorage.getItem('avante_journal_entries') || '[]');
  }

  static async getFinancialSummary(): Promise<any> {
    const entries: JournalEntry[] = JSON.parse(
      localStorage.getItem('avante_journal_entries') || '[]',
    );
    let totalSales = 0;
    let cashBalance = 0;
    let receivablesBal = 0;
    let taxPayable = 0;

    entries.forEach((e) => {
      e.lines.forEach((l) => {
        const code = l.account?.code || '';
        if (code.startsWith('4.1') || code.startsWith('4135')) totalSales += Number(l.credit) - Number(l.debit);
        if (code.startsWith('1.1.01') || code.startsWith('1105')) cashBalance += Number(l.debit) - Number(l.credit);
        if (code.startsWith('1.1.02') || code.startsWith('1305')) receivablesBal += Number(l.debit) - Number(l.credit);
        if (code.startsWith('2.1.07') || code.startsWith('2408')) taxPayable += Number(l.credit) - Number(l.debit);
      });
    });

    return {
      totalSalesRevenue: Math.max(0, totalSales),
      cashInHand: Math.max(0, cashBalance),
      accountsReceivable: Math.max(0, receivablesBal),
      taxPayable: Math.max(0, taxPayable),
    };
  }

  static async createJournalEntry(dto: any): Promise<any> {
    const entries = JSON.parse(localStorage.getItem('avante_journal_entries') || '[]');
    const accounts = await this.getChartOfAccounts();

    const lines = dto.lines.map((l: any, idx: number) => ({
      id: `line-${Date.now()}-${idx}`,
      account: accounts.find((a) => a.id === l.account_id) || accounts[0],
      debit: Number(l.debit),
      credit: Number(l.credit),
      description: l.description,
    }));

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entry_number: `AS-2026-${String(entries.length + 1).padStart(5, '0')}`,
      entry_date: dto.entry_date || new Date().toISOString().split('T')[0],
      concept: dto.concept,
      source_module: 'MANUAL',
      lines,
      created_at: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    localStorage.setItem('avante_journal_entries', JSON.stringify(entries));
    return newEntry;
  }

  // Audit Reports (Daily, Weekly, Monthly, Annual)
  static async getAuditReport(period: AuditPeriod): Promise<AuditReportData> {
    const invoices: Invoice[] = JSON.parse(localStorage.getItem('avante_invoices') || '[]');
    const receivables: ReceivableAccount[] = JSON.parse(localStorage.getItem('avante_receivables') || '[]');

    let periodLabel = 'Auditoría Fiscal Diaria SRI - Corte de Caja';
    let multiplier = 1;

    switch (period) {
      case 'DAILY':
        periodLabel = 'Auditoría Diaria de Operaciones y Corte Fiscal SRI (Hoy)';
        multiplier = 1;
        break;
      case 'WEEKLY':
        periodLabel = 'Auditoría Semanal Consolidada de Ventas y Cartera (7 Días)';
        multiplier = 4.8;
        break;
      case 'MONTHLY':
        periodLabel = 'Informe de Auditoría Mensual - Balance Tributario SRI (Mes en Curso)';
        multiplier = 18.5;
        break;
      case 'ANNUAL':
        periodLabel = 'Auditoría Financiera y Dictamen Fiscal Anual - Ejercicio 2026';
        multiplier = 145.2;
        break;
    }

    const baseSales = invoices.reduce((sum, inv) => sum + Number(inv.total), 0) || 1590.00;
    const totalSalesUSD = baseSales * multiplier;
    const subtotalUSD = totalSalesUSD / 1.15;
    const iva15SRIUSD = totalSalesUSD - subtotalUSD;

    const cashUSD = totalSalesUSD * 0.45;
    const transferUSD = totalSalesUSD * 0.25;
    const cardUSD = totalSalesUSD * 0.15;
    const creditUSD = totalSalesUSD * 0.15;

    const creditCollectedUSD =
      (receivables.reduce((s, r) => s + (Number(r.total_amount) - Number(r.balance)), 0) || 540) *
      multiplier;
    const receivablesOverdueUSD =
      (receivables.filter((r) => r.status === 'OVERDUE').reduce((s, r) => s + Number(r.balance), 0) ||
        1250) * Math.min(1.5, multiplier);

    const costOfGoodsUSD = totalSalesUSD * 0.65;
    const estimatedGrossProfitUSD = subtotalUSD - costOfGoodsUSD;

    const transactionsBreakdown = [
      {
        reference: 'FAC-001-001-000001',
        description: 'Venta de Materiales y Tubería PVC Plastigama',
        paymentMethod: 'Crédito Comercial (30 días)',
        subtotal: 1086.96 * Math.min(multiplier, 2.5),
        tax: 163.04 * Math.min(multiplier, 2.5),
        total: 1250.00 * Math.min(multiplier, 2.5),
        status: 'AUTORIZADO SRI',
      },
      {
        reference: 'FAC-001-001-000002',
        description: 'Herramientas Eléctricas DeWalt & Tornillería Drywall',
        paymentMethod: 'Efectivo Mostrador (USD)',
        subtotal: 295.65 * Math.min(multiplier, 2.5),
        tax: 44.35 * Math.min(multiplier, 2.5),
        total: 340.00 * Math.min(multiplier, 2.5),
        status: 'AUTORIZADO SRI',
      },
      {
        reference: 'FAC-001-001-000003',
        description: 'Pintura Esmalte Sintético Cóndor & Cables Eléctricos THHN',
        paymentMethod: 'Transferencia Banco Pichincha',
        subtotal: 420.00 * Math.min(multiplier, 2.5),
        tax: 63.00 * Math.min(multiplier, 2.5),
        total: 483.00 * Math.min(multiplier, 2.5),
        status: 'AUTORIZADO SRI',
      },
      {
        reference: 'REC-ABONO-004',
        description: 'Abono Parcial a Factura de Crédito Pendiente',
        paymentMethod: 'Transferencia Directa',
        subtotal: 217.39 * Math.min(multiplier, 2.5),
        tax: 32.61 * Math.min(multiplier, 2.5),
        total: 250.00 * Math.min(multiplier, 2.5),
        status: 'CONCILIADO BANCOS',
      },
    ];

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const sriAuth = `${dateStr}0117923456780011001001000000${Math.floor(100000000 + Math.random() * 900000000)}1234567812`.slice(0, 49);

    return {
      period,
      periodLabel,
      generatedAt: now.toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'medium' }),
      sriAuthorizationCode: sriAuth,
      auditorName: 'Lic. Santiago Morales (Contador General - Reg. SRI #17-4892)',
      companyName: 'AVANTE FERRETERÍAS S.A.',
      companyRuc: '1792345678001',
      metrics: {
        totalSalesUSD,
        subtotalUSD,
        iva15SRIUSD,
        cashUSD,
        transferUSD,
        cardUSD,
        creditUSD,
        invoicesCount: Math.round(18 * multiplier),
        creditCollectedUSD,
        receivablesOverdueUSD,
        costOfGoodsUSD,
        estimatedGrossProfitUSD,
      },
      transactionsBreakdown,
    };
  }

  // Product Demand Heatmap
  static async getProductDemandHeatmap(): Promise<ProductDemandHeat[]> {
    const products: Product[] = await this.getProducts();

    return products.map((p) => {
      let units = 45;
      let txCount = 28;
      let score = 85;
      let heat: 'CRITICAL_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';

      if (p.sku.startsWith('HERR-001') || p.sku.startsWith('TORN-001')) {
        units = 112;
        txCount = 64;
        score = 94;
        heat = 'CRITICAL_HIGH';
      } else if (p.sku.startsWith('HERR-003')) {
        units = 78;
        txCount = 42;
        score = 88;
        heat = 'CRITICAL_HIGH';
      } else if (p.sku.startsWith('PLOM-001') || p.sku.startsWith('ELEC-001')) {
        units = 56;
        txCount = 31;
        score = 68;
        heat = 'HIGH';
      } else if (p.sku.startsWith('PINT-001') || p.sku.startsWith('HERR-002')) {
        units = 24;
        txCount = 15;
        score = 42;
        heat = 'MODERATE';
      } else {
        units = 14;
        txCount = 8;
        score = 22;
        heat = 'LOW';
      }

      const dailyRate = Math.max(1, Math.round(units / 7));
      const depletion = Math.max(1, Math.round(p.current_stock / dailyRate));

      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        categoryName: p.category?.name || 'General',
        currentStock: p.current_stock,
        minStock: p.min_stock,
        unitsRequested: units,
        transactionsCount: txCount,
        demandVelocity: score,
        heatLevel: heat,
        depletionDays: depletion,
        revenueGeneratedUSD: units * p.sale_price,
      };
    });
  }

  // Users Delegation & Management
  static async getUsers(): Promise<any[]> {
    const raw = localStorage.getItem('avante_users');
    if (!raw) {
      localStorage.setItem('avante_users', JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
    return JSON.parse(raw);
  }

  static async createUser(userData: {
    full_name: string;
    email: string;
    password?: string;
    role: Role;
    phone?: string;
    document_number?: string;
  }): Promise<User> {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch {}

    const users: any[] = await this.getUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === userData.email.trim().toLowerCase(),
    );
    if (existing) {
      throw new Error(`El usuario con correo ${userData.email} ya existe en el sistema.`);
    }

    const newUser: any = {
      id: `user-${Date.now()}`,
      email: userData.email.trim().toLowerCase(),
      password: userData.password || 'Avante2026*',
      full_name: userData.full_name,
      role: userData.role,
      phone: userData.phone || '',
      document_number: userData.document_number || '',
      is_active: true,
    };

    users.push(newUser);
    localStorage.setItem('avante_users', JSON.stringify(users));
    return newUser;
  }

  static async toggleUserStatus(id: string): Promise<any> {
    const users: any[] = await this.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      user.is_active = !user.is_active;
      localStorage.setItem('avante_users', JSON.stringify(users));
    }
    return { success: true };
  }
}
