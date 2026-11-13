import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/inventory/entities/category.entity';
import { Product } from '../../modules/inventory/entities/product.entity';
import { StockMovement } from '../../modules/inventory/entities/stock-movement.entity';
import { Customer } from '../../modules/sales/entities/customer.entity';
import { Invoice } from '../../modules/sales/entities/invoice.entity';
import { InvoiceItem } from '../../modules/sales/entities/invoice-item.entity';
import { ReceivableAccount } from '../../modules/receivables/entities/receivable-account.entity';
import { CreditPayment } from '../../modules/receivables/entities/credit-payment.entity';
import { AccountingAccount } from '../../modules/accounting/entities/accounting-account.entity';
import { JournalEntry } from '../../modules/accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../modules/accounting/entities/journal-entry-line.entity';
import { AccountType, CreditStatus, MovementType, Role } from '../../common/enums';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_DATABASE || 'avante_db',
  entities: [
    User,
    Category,
    Product,
    StockMovement,
    Customer,
    Invoice,
    InvoiceItem,
    ReceivableAccount,
    CreditPayment,
    AccountingAccount,
    JournalEntry,
    JournalEntryLine,
  ],
  synchronize: true,
});

async function runSeed() {
  console.log('🌱 Conectando a PostgreSQL (Ecuador USD)...');
  await AppDataSource.initialize();
  console.log('✅ Base de datos conectada.');

  const userRepo = AppDataSource.getRepository(User);
  const catRepo = AppDataSource.getRepository(Category);
  const prodRepo = AppDataSource.getRepository(Product);
  const movementRepo = AppDataSource.getRepository(StockMovement);
  const custRepo = AppDataSource.getRepository(Customer);
  const accRepo = AppDataSource.getRepository(AccountingAccount);

  // 1. Usuarios
  console.log('👤 Sembrando usuarios iniciales...');
  const salt = await bcrypt.genSalt(10);

  const usersData = [
    {
      email: 'admin@avante.com',
      password_hash: await bcrypt.hash('Admin123*', salt),
      full_name: 'Carlos Mendoza (Administrador General)',
      role: Role.ADMIN,
    },
    {
      email: 'vendedor@avante.com',
      password_hash: await bcrypt.hash('Vendedor123*', salt),
      full_name: 'Laura Ramírez (Vendedora Mostrador)',
      role: Role.VENDEDOR,
    },
    {
      email: 'contador@avante.com',
      password_hash: await bcrypt.hash('Contador123*', salt),
      full_name: 'Santiago Morales (Contador Oficial)',
      role: Role.CONTADOR,
    },
  ];

  for (const u of usersData) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      await userRepo.save(userRepo.create(u));
    }
  }

  // 2. Plan de Cuentas (NIIF Ecuador)
  console.log('📑 Sembrando catálogo contable NIIF Ecuador...');
  const accountsData = [
    { code: '1.1.01.01', name: 'Caja General - Punto de Venta (USD)', account_type: AccountType.ASSET, level: 4 },
    { code: '1.1.01.02', name: 'Bancos e Instituciones Financieras', account_type: AccountType.ASSET, level: 4 },
    { code: '1.1.02.01', name: 'Cuentas por Cobrar Clientes (Cartera)', account_type: AccountType.ASSET, level: 4 },
    { code: '1.1.03.01', name: 'Inventario de Mercaderías Ferretería', account_type: AccountType.ASSET, level: 4 },
    { code: '2.1.07.01', name: 'IVA en Ventas por Pagar (15% SRI)', account_type: AccountType.LIABILITY, level: 4 },
    { code: '4.1.01.01', name: 'Ventas de Materiales y Ferretería', account_type: AccountType.REVENUE, level: 4 },
    { code: '5.1.01.01', name: 'Costo de Ventas de Mercaderías', account_type: AccountType.EXPENSE, level: 4 },
  ];

  for (const acc of accountsData) {
    const exists = await accRepo.findOne({ where: { code: acc.code } });
    if (!exists) {
      await accRepo.save(accRepo.create(acc));
    }
  }

  // 3. Categorías
  console.log('📦 Sembrando categorías de inventario...');
  const categoriesData = [
    { code: 'HERR', name: 'Herramientas Manuales y Eléctricas', description: 'Martillos, taladros, amoladoras' },
    { code: 'TORN', name: 'Tornillería y Fijaciones', description: 'Tornillos drywall, pernos, tuercas, tarugos' },
    { code: 'PINT', name: 'Pinturas y Acabados', description: 'Esmaltes, látex, disolventes, brochas' },
    { code: 'ELEC', name: 'Materiales Eléctricos', description: 'Cables, breakers, tomacorrientes, iluminación' },
    { code: 'PLOM', name: 'Tubería y Plomería', description: 'Tubería PVC presión, codos, uniones, llaves de paso' },
  ];

  const catMap = new Map<string, Category>();
  for (const c of categoriesData) {
    let cat = await catRepo.findOne({ where: { code: c.code } });
    if (!cat) {
      cat = await catRepo.save(catRepo.create(c));
    }
    catMap.set(c.code, cat);
  }

  // 4. Productos con precios en DÓLARES (USD) e IVA 15% SRI
  console.log('🔨 Sembrando productos en Dólares (USD)...');
  const productsData = [
    {
      category_id: catMap.get('HERR').id,
      sku: 'HERR-001',
      barcode: '786123456001',
      name: 'Martillo de Uña 16oz Mango Fibra Antideslizante',
      unit_of_measure: 'UND',
      cost_price: 6.20,
      sale_price: 9.90,
      current_stock: 35,
      min_stock: 5,
      tax_rate: 15.0,
    },
    {
      category_id: catMap.get('HERR').id,
      sku: 'HERR-002',
      barcode: '786123456002',
      name: 'Taladro Percutor 1/2" 650W Profesional DeWalt/Bosch',
      unit_of_measure: 'UND',
      cost_price: 45.00,
      sale_price: 68.50,
      current_stock: 8,
      min_stock: 3,
      tax_rate: 15.0,
    },
    {
      category_id: catMap.get('TORN').id,
      sku: 'TORN-001',
      barcode: '786123456003',
      name: 'Tornillo Drywall 6x1" Punta Fina Caja x 1000 unds',
      unit_of_measure: 'CAJA',
      cost_price: 7.50,
      sale_price: 11.80,
      current_stock: 45,
      min_stock: 10,
      tax_rate: 15.0,
    },
    {
      category_id: catMap.get('PINT').id,
      sku: 'PINT-001',
      barcode: '786123456004',
      name: 'Esmalte Sintético Blanco Puro Galón Cóndor/Pintulac',
      unit_of_measure: 'GALÓN',
      cost_price: 16.50,
      sale_price: 24.90,
      current_stock: 15,
      min_stock: 4,
      tax_rate: 15.0,
    },
    {
      category_id: catMap.get('ELEC').id,
      sku: 'ELEC-001',
      barcode: '786123456005',
      name: 'Cable THHN #14 AWG Cobre Rollo 100 Metros',
      unit_of_measure: 'ROLLO',
      cost_price: 36.00,
      sale_price: 52.00,
      current_stock: 12,
      min_stock: 3,
      tax_rate: 15.0,
    },
    {
      category_id: catMap.get('PLOM').id,
      sku: 'PLOM-001',
      barcode: '786123456006',
      name: 'Tubo PVC Presión 1/2" Tramo x 6 Metros Plastigama',
      unit_of_measure: 'TUBO',
      cost_price: 3.20,
      sale_price: 4.90,
      current_stock: 30,
      min_stock: 8,
      tax_rate: 15.0,
    },
    {
      category_id: catMap.get('HERR').id,
      sku: 'HERR-003',
      barcode: '786123456007',
      name: 'Flexómetro 5 Metros Cinta Métrica Reforzada Stanley',
      unit_of_measure: 'UND',
      cost_price: 2.80,
      sale_price: 4.50,
      current_stock: 2,
      min_stock: 5,
      tax_rate: 15.0,
    },
  ];

  for (const p of productsData) {
    const exists = await prodRepo.findOne({ where: { sku: p.sku } });
    if (!exists) {
      const prod = await prodRepo.save(prodRepo.create(p));
      await movementRepo.save(
        movementRepo.create({
          product_id: prod.id,
          movement_type: MovementType.IN_ADJUST,
          quantity: prod.current_stock,
          previous_stock: 0,
          new_stock: prod.current_stock,
          unit_cost: prod.cost_price,
          reason: 'Inventario inicial de apertura ferretería Avante Ecuador',
          reference_id: `INIT-${prod.sku}`,
        }),
      );
    }
  }

  // 5. Clientes Ecuador con RUC y Cédula
  console.log('🤝 Sembrando clientes con RUC y líneas de crédito en USD...');
  const customersData = [
    {
      document_type: 'CÉDULA',
      document_number: '9999999999',
      name: 'Consumidor Final (Venta Mostrador)',
      phone: '0990000000',
      email: 'mostrador@avante.ec',
      address: 'Quito, Ecuador',
      credit_limit: 0,
      current_debt: 0,
      credit_status: CreditStatus.ACTIVE,
    },
    {
      document_type: 'RUC',
      document_number: '1792345678001',
      name: 'Construcciones Andinas Cía. Ltda.',
      phone: '022555889',
      email: 'compras@construccionesandinas.ec',
      address: 'Av. República y Eloy Alfaro, Quito',
      credit_limit: 5000.00,
      current_debt: 1250.00,
      credit_status: CreditStatus.ACTIVE,
    },
    {
      document_type: 'CÉDULA',
      document_number: '1718945620',
      name: 'Ing. Carlos Pérez (Maestro Contratista)',
      phone: '0998774411',
      email: 'carlosperez.obras@gmail.com',
      address: 'Calle Guayaquil y Chile, Centro Histórico',
      credit_limit: 1500.00,
      current_debt: 340.00,
      credit_status: CreditStatus.ACTIVE,
    },
  ];

  for (const c of customersData) {
    const exists = await custRepo.findOne({ where: { document_number: c.document_number } });
    if (!exists) {
      await custRepo.save(custRepo.create(c));
    }
  }

  console.log('✅ Semilla completada exitosamente (Ecuador USD).');
  await AppDataSource.destroy();
}

runSeed().catch((err) => {
  console.error('❌ Error durante la semilla:', err);
  process.exit(1);
});
