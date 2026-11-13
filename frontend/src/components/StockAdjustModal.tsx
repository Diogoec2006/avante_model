import React, { useState } from 'react';
import { Product } from '../types';
import { ApiClient } from '../api/client';
import { AlertTriangle, X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface StockAdjustModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  if (!product) return null;

  const [movementType, setMovementType] = useState<'IN_PURCHASE' | 'IN_ADJUST' | 'OUT_DAMAGE' | 'OUT_ADJUST'>('IN_PURCHASE');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(product.cost_price || 0);
  const [reason, setReason] = useState<string>('');
  const [referenceId, setReferenceId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('La justificación del ajuste de stock es estrictamente obligatoria.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ApiClient.adjustStock({
        product_id: product.id,
        movement_type: movementType,
        quantity: Number(quantity),
        unit_cost: Number(unitCost) > 0 ? Number(unitCost) : undefined,
        reason: reason.trim(),
        reference_id: referenceId.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar el ajuste.');
    } finally {
      setLoading(false);
    }
  };

  const isInput = movementType === 'IN_PURCHASE' || movementType === 'IN_ADJUST';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ajuste de Stock Justificado
            </h3>
            <p className="text-xs text-slate-500">
              {product.name} (SKU: {product.sku})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-semibold">Existencias actuales en bodega:</span>
            <span className="text-sm font-black text-red-700">
              {product.current_stock} {product.unit_of_measure}
            </span>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('IN_PURCHASE')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  movementType === 'IN_PURCHASE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                <span>Entrada por Compra</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('IN_ADJUST')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  movementType === 'IN_ADJUST'
                    ? 'bg-blue-50 text-blue-800 border-blue-400 ring-1 ring-blue-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4 text-blue-600" />
                <span>Ajuste Positivo (+ Conteo)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('OUT_DAMAGE')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  movementType === 'OUT_DAMAGE'
                    ? 'bg-red-50 text-red-800 border-red-400 ring-1 ring-red-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-red-600" />
                <span>Merma / Daño en Bodega</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('OUT_ADJUST')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  movementType === 'OUT_ADJUST'
                    ? 'bg-amber-50 text-amber-800 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4 text-amber-600" />
                <span>Ajuste Negativo (- Faltante)</span>
              </button>
            </div>
          </div>

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad ({product.unit_of_measure})
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Costo Unitario ($) {isInput ? '(Actualiza costo)' : ''}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Justification / Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Justificación Obligatoria <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Ingreso por factura de compra #8902 del proveedor Argos S.A."
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white placeholder-slate-400"
            />
          </div>

          {/* Reference doc */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Documento de Referencia (Opcional)
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="Ej: Factura Proveedor #12345 o Acta de Conteo"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white placeholder-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? <span>Guardando...</span> : <span>Confirmar Ajuste</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
