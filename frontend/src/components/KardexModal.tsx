import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ApiClient } from '../api/client';
import { X, Calendar, FileText, User } from 'lucide-react';

interface KardexModalProps {
  product: Product | null;
  onClose: () => void;
}

export const KardexModal: React.FC<KardexModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchKardex = async () => {
      try {
        setLoading(true);
        const data = await ApiClient.getKardex(product.id);
        setMovements(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKardex();
  }, [product.id]);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'IN_PURCHASE':
        return { label: 'Compra Proveedor', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'IN_ADJUST':
        return { label: 'Entrada Ajuste', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'OUT_SALE':
        return { label: 'Venta Mostrador POS', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'OUT_DAMAGE':
        return { label: 'Merma / Daño', bg: 'bg-red-100 text-red-800 border-red-200' };
      case 'OUT_ADJUST':
        return { label: 'Salida Ajuste', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: type, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kárdex de Movimientos (Historial de Bodega)
            </h3>
            <p className="text-xs text-slate-500">
              {product.name} | SKU: <span className="font-mono text-red-700 font-bold">{product.sku}</span> | Stock actual: <span className="font-bold text-slate-900">{product.current_stock}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-white">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Cargando kárdex...</div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No hay movimientos registrados para este producto.</div>
          ) : (
            movements.map((m) => {
              const badge = getMovementBadge(m.movement_type);
              const isPositive = m.movement_type.startsWith('IN');
              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(m.created_at).toLocaleString('es-CO')}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isPositive ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {isPositive ? '+' : '-'}{m.quantity} {product.unit_of_measure}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (Saldo resultante: {m.new_stock})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between text-slate-700">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold text-slate-800">
                        Justificación: <span className="text-slate-600 font-normal italic">{m.reason}</span>
                      </p>
                      {m.reference_id && (
                        <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>Documento soporte: {m.reference_id}</span>
                        </p>
                      )}
                    </div>

                    {m.user && (
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{m.user.full_name?.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
