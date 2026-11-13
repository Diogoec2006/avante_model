import React, { useState } from 'react';
import { ReceivableAccount } from '../types';
import { ApiClient } from '../api/client';
import { formatUSD } from '../utils/format';
import { X, DollarSign, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  account: ReceivableAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  account,
  onClose,
  onSuccess,
}) => {
  if (!account) return null;

  const [amount, setAmount] = useState<number>(Number(account.balance));
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      setError('El valor del abono debe ser mayor a cero.');
      return;
    }

    if (paymentAmount > Number(account.balance)) {
      setError(`El abono no puede exceder el saldo de ${formatUSD(account.balance)}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ApiClient.registerPayment({
        receivable_account_id: account.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar el abono a cartera.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Registrar Abono a Cartera (Ecuador USD)
            </h3>
            <p className="text-xs text-slate-500">
              Factura #{account.invoice?.invoice_number || 'Crédito'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Details Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Cliente / RUC:</span>
              <span className="font-bold text-slate-800">{account.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Total Facturado USD:</span>
              <span className="font-mono text-slate-800 font-bold">{formatUSD(account.total_amount)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200 font-black">
              <span className="text-red-700">Saldo Pendiente USD:</span>
              <span className="text-red-700 text-base font-mono">
                {formatUSD(account.balance)}
              </span>
            </div>
          </div>

          {/* Amount to Pay */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Valor del Abono ($ USD)
              </label>
              <button
                type="button"
                onClick={() => setAmount(Number(account.balance))}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Pagar Saldo Total
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Medio de Cobro
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH', label: 'Efectivo USD' },
                { id: 'TRANSFER', label: 'Transferencia' },
                { id: 'CHECK', label: 'Cheque' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`h-11 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === m.id
                      ? 'bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observaciones / No. Depósito / Banco (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Depósito Banco Pichincha Ref #90210"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white placeholder-slate-400"
            />
          </div>

          {/* Actions - Ergonomic buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? <span>Procesando...</span> : <span>Generar Recibo de Caja</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
