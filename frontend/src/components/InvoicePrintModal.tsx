import React from 'react';
import { Invoice } from '../types';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatUSD } from '../utils/format';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  onClose,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Comprobante Electrónico SRI: {invoice.invoice_number}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Receipt (Ecuador SRI standard) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 font-mono text-xs text-slate-800 print:bg-white print:p-0">
          <div
            id="thermal-receipt"
            className="bg-white text-black p-5 rounded-xl border border-slate-300 shadow-sm max-w-sm mx-auto"
          >
            {/* Header / Logo */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <div className="flex justify-center mb-1">
                <img
                  src="/logo_avante.avif"
                  alt="Avante"
                  className="h-10 object-contain"
                />
              </div>
              <h1 className="text-base font-black tracking-tight uppercase text-red-800">
                Ferretería Avante Cía. Ltda.
              </h1>
              <p className="text-[10px] text-gray-800 font-bold">RUC: 1792345678001</p>
              <p className="text-[10px] text-gray-700">
                Matriz: Av. Eloy Alfaro N34-120 y Amazonas
              </p>
              <p className="text-[10px] text-gray-700">Quito - Ecuador | Tel: (02) 2555-019</p>
              <p className="text-[9px] text-gray-600 italic">Obligado a llevar Contabilidad: SÍ</p>

              <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-gray-100 text-[9px] font-bold rounded border border-gray-300">
                FACTURA ELECTRÓNICA
              </div>
              <p className="text-[11px] font-black mt-1 text-gray-900">
                No. {invoice.invoice_number}
              </p>
              <p className="text-[9px] text-gray-500">
                Fecha de Emisión: {new Date(invoice.created_at).toLocaleString('es-EC')}
              </p>
            </div>

            {/* Customer Details */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="font-bold text-gray-600">Razón Social:</span>
                <span className="font-bold text-gray-900 truncate max-w-[180px]">{invoice.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-600">RUC / Cédula:</span>
                <span className="text-gray-800 font-mono font-bold">{invoice.customer?.document_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-600">Forma de Pago:</span>
                <span className="font-bold text-red-800">{invoice.payment_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-600">Moneda:</span>
                <span className="font-bold text-gray-800">DÓLARES (USD)</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-[9px] uppercase border-b border-gray-200 pb-1 mb-1 text-gray-600">
                <span className="w-1/2">Descripción</span>
                <span className="w-1/6 text-center">Cant</span>
                <span className="w-1/3 text-right">Total USD</span>
              </div>
              {invoice.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px] py-0.5">
                  <span className="w-1/2 truncate font-medium">{item.product?.name || 'Producto'}</span>
                  <span className="w-1/6 text-center">{item.quantity}</span>
                  <span className="w-1/3 text-right font-bold text-gray-900 font-mono">
                    {formatUSD(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown Ecuador */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal 15% (Base Imponible):</span>
                <span className="font-mono font-bold text-gray-800">{formatUSD(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal 0% (Tarifa Cero):</span>
                <span className="font-mono text-gray-800">$0.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA 15% (SRI):</span>
                <span className="font-mono font-bold text-gray-800">{formatUSD(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-gray-300 text-gray-900">
                <span>VALOR TOTAL USD:</span>
                <span className="text-red-700 font-mono text-base">{formatUSD(invoice.total)}</span>
              </div>
            </div>

            {/* SRI Fiscal Authorization */}
            <div className="pt-3 text-center text-[8px] text-gray-600 space-y-1">
              <div className="flex items-center justify-center space-x-1 font-bold text-gray-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autorizado por el Servicio de Rentas Internas (SRI)</span>
              </div>
              <p className="text-[7px] text-gray-500 font-bold uppercase mt-1">
                Clave de Acceso / Número de Autorización:
              </p>
              <p className="break-all font-mono text-[7px] bg-gray-100 p-1.5 rounded border border-gray-200 text-gray-800 font-bold">
                {invoice.fiscal_uuid || '1311202601179234567800120010010000000011234567813'}
              </p>
              <p className="text-[8px] text-gray-500">Ambiente: PRODUCCIÓN | Emisión: NORMAL</p>
              <div className="pt-2 text-gray-900 font-bold text-[9px]">
                ¡Gracias por su compra en Ferretería Avante - Ecuador!
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket (80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
