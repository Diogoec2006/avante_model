export enum Role {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
  CONTADOR = 'CONTADOR',
  ASISTENTE_BODEGA = 'ASISTENTE_BODEGA',
}

export enum MovementType {
  IN_PURCHASE = 'IN_PURCHASE',
  IN_ADJUST = 'IN_ADJUST',
  OUT_SALE = 'OUT_SALE',
  OUT_DAMAGE = 'OUT_DAMAGE',
  OUT_ADJUST = 'OUT_ADJUST',
}

export enum PaymentType {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  CREDIT = 'CREDIT',
}

export enum CreditStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum ReceivableStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

