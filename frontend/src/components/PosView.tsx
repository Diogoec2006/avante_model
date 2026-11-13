import React, { useState, useEffect, useRef } from 'react';
import { Product, Customer, CartItem, Invoice, PaymentType, User as UserType } from '../types';
import { ApiClient } from '../api/client';
import { InvoicePrintModal } from './InvoicePrintModal';
import { formatUSD } from '../utils/format';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  User,
  Barcode,
  ArrowRight,
  Banknote,
  CreditCard,
  Building2,
  FileCheck2,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PosViewProps {
  currentUser?: UserType;
}

export const PosView: React.FC<PosViewProps> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerCredit, setCustomerCredit] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Customer Registration Modal for Sellers
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState<boolean>(false);
  const [quickCustomer, setQuickCustomer] = useState({
    document_type: 'RUC',
    document_number: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: 1000,
  });
  const [quickError, setQuickError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const effectiveUser = currentUser || (JSON.parse(localStorage.getItem('avante_current_user') || 'null') as UserType) || {
    id: 'user-admin-1',
    role: 'ADMIN' as const,
    full_name: 'Administrador',
    email: 'admin@avante.com',
  };

  useEffect(() => {
    loadInitialData();
  }, [effectiveUser?.id, effectiveUser?.role]);

  const loadInitialData = async () => {
    try {
      const sellerId = effectiveUser.role === 'VENDEDOR' ? effectiveUser.id : undefined;
      const [prods, custs] = await Promise.all([
        ApiClient.getProducts(),
        ApiClient.getCustomers(sellerId),
      ]);
      setProducts(prods);
      setCustomers(custs);
      if (custs.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custs[0].id);
      }
    } catch (err: any) {
      console.error('Error cargando catálogo POS:', err);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      ApiClient.getCustomerCreditStatus(selectedCustomerId)
        .then((credit) => setCustomerCredit(credit))
        .catch(console.error);
    }
  }, [selectedCustomerId]);

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.barcode.includes(term) ||
      p.sku.toLowerCase().includes(term)
    );
  });

  const addToCart = (product: Product) => {
    if (product.current_stock <= 0) {
      setError(`El producto '${product.name}' no tiene existencias en bodega.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) {
          setError(`No hay más stock disponible de '${product.name}' (Stock: ${product.current_stock}).`);
          return prev;
        }
        return prev.map((item) => {
          if (item.product.id === product.id) {
            const qty = item.quantity + 1;
            const sub = item.unitPrice * qty;
            const tax = sub * (item.taxRate / 100);
            return {
              ...item,
              quantity: qty,
              subtotal: sub,
              taxAmount: tax,
              total: sub + tax,
            };
          }
          return item;
        });
      } else {
        const qty = 1;
        const price = Number(product.sale_price);
        const taxRate = Number(product.tax_rate !== undefined ? product.tax_rate : 15);
        const sub = price * qty;
        const tax = sub * (taxRate / 100);
        return [
          ...prev,
          {
            product,
            quantity: qty,
            unitPrice: price,
            taxRate,
            subtotal: sub,
            taxAmount: tax,
            total: sub + tax,
          },
        ];
      }
    });

    setError(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.current_stock) {
              setError(`Existencias máximas alcanzadas para '${item.product.name}'.`);
              return item;
            }
            const sub = item.unitPrice * newQty;
            const tax = sub * (item.taxRate / 100);
            return {
              ...item,
              quantity: newQty,
              subtotal: sub,
              taxAmount: tax,
              total: sub + tax,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setError(null);
  };

  const subtotalCart = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxCart = cart.reduce((sum, item) => sum + item.taxAmount, 0);
  const totalCart = subtotalCart + taxCart;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('El carrito de compras está vacío.');
      return;
    }

    if (paymentType === PaymentType.CREDIT) {
      if (!customerCredit || !customerCredit.canPurchaseCredit) {
        setError(`Línea de crédito no disponible para '${customerCredit?.name}'.`);
        return;
      }
      if (totalCart > customerCredit.availableCredit) {
        setError(
          `Cupo de crédito insuficiente (${formatUSD(customerCredit.availableCredit)} disponible vs ${formatUSD(totalCart)} requerido).`,
        );
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        customerId: selectedCustomerId,
        paymentType,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
      };

      const invoice = await ApiClient.checkoutPos(payload);
      setCreatedInvoice(invoice);
      clearCart();
      loadInitialData();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la venta en POS.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);

    if (quickCustomer.document_type === 'RUC' && quickCustomer.document_number.length !== 13) {
      setQuickError('El RUC en Ecuador debe tener exactamente 13 dígitos numéricos.');
      return;
    }
    if (quickCustomer.document_type === 'CÉDULA' && quickCustomer.document_number.length !== 10) {
      setQuickError('La Cédula en Ecuador debe tener exactamente 10 dígitos numéricos.');
      return;
    }

    try {
      const newCust = await ApiClient.createCustomer({
        ...quickCustomer,
        assigned_seller_id: effectiveUser.role === 'VENDEDOR' ? effectiveUser.id : undefined,
        assigned_seller_name: effectiveUser.role === 'VENDEDOR' ? effectiveUser.full_name : undefined,
      });

      setShowQuickCustomerModal(false);
      await loadInitialData();
      setSelectedCustomerId(newCust.id);
      setQuickCustomer({
        document_type: 'RUC',
        document_number: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        credit_limit: 1000,
      });
    } catch (err: any) {
      setQuickError(err.message || 'Error al registrar cliente');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="font-bold">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-800 font-black text-base px-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Search & Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Escanear código de barras o buscar por nombre / SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-12 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
              <Barcode className="w-6 h-6 text-red-700" />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.current_stock <= 0;
              const isLowStock = p.current_stock <= p.min_stock && !isOutOfStock;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                        {p.sku}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-800 border border-red-200">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Stock: {p.current_stock} {p.unit_of_measure}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Stock: {p.current_stock} {p.unit_of_measure}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Cód: {p.barcode}
                    </p>
                  </div>

                  {/* Price & Well-sized Add Button */}
                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block leading-none mb-0.5">Precio USD</span>
                      <span className="text-base font-black text-red-700 font-mono">
                        {formatUSD(p.sale_price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && addToCart(p)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: POS Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-50 text-red-700 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Carrito de Mostrador ({cart.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Ecuador (USD $)</span>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold border border-red-200 flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Carrito</span>
              </button>
            )}
          </div>

          {/* Customer Selection with Attribution & Quick Registration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
                <User className="w-4 h-4 text-slate-500" />
                <span>Cliente Facturación:</span>
              </label>

              {/* Quick Registration Button for Vendedor / Admin */}
              <button
                type="button"
                onClick={() => {
                  setQuickError(null);
                  setShowQuickCustomerModal(true);
                }}
                className="text-[11px] font-black text-red-800 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Registrar Cliente</span>
              </button>
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-3 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-medium"
            >
              {customers.map((c) => {
                const isGeneric = c.document_number === '9999999999';
                const isMine = c.assigned_seller_id === effectiveUser.id;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.document_type}: {c.document_number})
                    {isMine ? ' [🔒 Tu Cartera]' : isGeneric ? ' [Mostrador]' : ''}
                  </option>
                );
              })}
            </select>

            {/* Exclusive Attribution Badge */}
            {(() => {
              const selectedCust = customers.find((c) => c.id === selectedCustomerId);
              if (selectedCust && selectedCust.document_number !== '9999999999') {
                return (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cliente Exclusivo de tu Cartera</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-mono">
                      {selectedCust.document_type}: {selectedCust.document_number}
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {customerCredit && customerCredit.creditLimit > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Cupo de Crédito:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatUSD(customerCredit.creditLimit)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Deuda Actual:</span>
                  <span className="font-mono font-bold text-red-600">
                    {formatUSD(customerCredit.currentDebt)}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t border-slate-200 text-emerald-700">
                  <span>Cupo Disponible:</span>
                  <span className="font-mono text-sm">
                    {formatUSD(customerCredit.availableCredit)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center">
                <ShoppingCart className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
                <span className="font-bold text-slate-600">Carrito vacío</span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Haz clic en "+ Agregar" para añadir productos
                </span>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-800 truncate max-w-[170px]">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500">
                      {formatUSD(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {/* Ergonomic quantity buttons */}
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-red-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-slate-900 w-20 text-right text-xs">
                      {formatUSD(item.total)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Type Selection - Large Ergonomic Buttons */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Forma de Pago (Ecuador)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: PaymentType.CASH, label: 'Efectivo USD', icon: Banknote },
                { id: PaymentType.CARD, label: 'Tarjeta Déb./Créd.', icon: CreditCard },
                { id: PaymentType.TRANSFER, label: 'Transferencia Bancaria', icon: Building2 },
                { id: PaymentType.CREDIT, label: 'Crédito Directo', icon: FileCheck2 },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentType === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentType(m.id)}
                    className={`h-12 px-3 flex items-center justify-center space-x-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-red-700 text-white border-red-700 shadow-md ring-2 ring-red-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtotal, IVA 15% & Total USD Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Base Imponible 15%):</span>
              <span className="font-mono font-bold text-slate-800">
                {formatUSD(subtotalCart)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA 15% (SRI Ecuador):</span>
              <span className="font-mono font-bold text-slate-800">
                {formatUSD(taxCart)}
              </span>
            </div>
            <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL A PAGAR (USD):</span>
              <span className="font-mono text-red-700 text-xl">
                {formatUSD(totalCart)}
              </span>
            </div>
          </div>

          {/* Big Green Checkout Button */}
          <button
            type="button"
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl text-base font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Emitiendo Comprobante Electrónico...</span>
            ) : (
              <>
                <span>Cobrar y Emitir Factura</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <InvoicePrintModal
        invoice={createdInvoice}
        onClose={() => setCreatedInvoice(null)}
      />

      {/* Quick Customer Registration Modal */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Registrar Nuevo Cliente (POS Mostrador)
                </h3>
                <p className="text-xs text-slate-500">
                  Atribución directa y exclusiva a tu cartera de ventas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickCustomerModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {quickError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{quickError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={quickCustomer.document_type}
                    onChange={(e) =>
                      setQuickCustomer({ ...quickCustomer, document_type: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium"
                  >
                    <option value="RUC">RUC (13 Dígitos)</option>
                    <option value="CÉDULA">Cédula (10 Dígitos)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Número de Documento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1792345678001"
                    value={quickCustomer.document_number}
                    onChange={(e) =>
                      setQuickCustomer({ ...quickCustomer, document_number: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo / Razón Social
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Constructora Pichincha S.A."
                  value={quickCustomer.name}
                  onChange={(e) =>
                    setQuickCustomer({ ...quickCustomer, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="text"
                    placeholder="0991234567"
                    value={quickCustomer.phone}
                    onChange={(e) =>
                      setQuickCustomer({ ...quickCustomer, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cupo Crédito Solicitado (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={quickCustomer.credit_limit}
                    onChange={(e) =>
                      setQuickCustomer({
                        ...quickCustomer,
                        credit_limit: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correo Electrónico (SRI)
                </label>
                <input
                  type="email"
                  placeholder="facturacion@cliente.ec"
                  value={quickCustomer.email}
                  onChange={(e) =>
                    setQuickCustomer({ ...quickCustomer, email: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  Cliente protegido: únicamente <strong>{effectiveUser.full_name}</strong> podrá facturarle.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Guardar y Seleccionar en POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
