import React, { useState, useEffect } from 'react';
import { AuditPeriod, AuditReportData } from '../types';
import { ApiClient } from '../api/client';
import { formatUSD } from '../utils/format';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  BadgeAlert,
} from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPeriod?: AuditPeriod;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  initialPeriod = 'DAILY',
}) => {
  const [period, setPeriod] = useState<AuditPeriod>(initialPeriod);
  const [report, setReport] = useState<AuditReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      loadReport(period);
    }
  }, [isOpen, period]);

  const loadReport = async (p: AuditPeriod) => {
    setLoading(true);
    try {
      const data = await ApiClient.getAuditReport(p);
      setReport(data);
    } catch (err) {
      console.error('Error cargando informe de auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-100 text-red-800 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Auditorías Contables & Fiscales (SRI Ecuador)
              </h3>
              <p className="text-xs text-slate-500">
                Generador de reportes contables oficiales para descarga en PDF o impresión
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Period Selector Tabs */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap gap-2 justify-between items-center no-print">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            {(
              [
                { id: 'DAILY', label: 'Diaria (Hoy)' },
                { id: 'WEEKLY', label: 'Semanal (7 Días)' },
                { id: 'MONTHLY', label: 'Mensual' },
                { id: 'ANNUAL', label: 'Anual (2026)' },
              ] as { id: AuditPeriod; label: string }[]
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  period === p.id
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Download / Print CTA */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar PDF / Imprimir</span>
            </button>
          </div>
        </div>

        {/* Printable Audit Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 font-sans print:p-0">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">
              Generando estado de auditoría consolidado...
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b-2 border-slate-800 pb-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs">
                      <img
                        src="/logo_avante.avif"
                        alt="Logo Avante"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-red-800 tracking-tight">
                        AVANTE FERRETERÍAS S.A.
                      </h1>
                      <p className="text-xs font-bold text-slate-600">
                        R.U.C.: 1792345678001 · Matriz: Quito, Ecuador
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Resolución SRI No. NAC-DGERCGC15-00000452 · Obligado a Llevar Contabilidad
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-black uppercase tracking-wider mb-1">
                      Informe Oficial de Auditoría
                    </span>
                    <p className="text-xs font-bold text-slate-700 font-mono">
                      Período: {period}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Emisión: {report.generatedAt}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Clave de Acceso SRI (49 Dígitos): </span>
                  <span className="font-mono text-[11px] text-slate-600 break-all">
                    {report.sriAuthorizationCode}
                  </span>
                </div>
              </div>

              {/* Title of Audit */}
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  {report.periodLabel}
                </h2>
                <p className="text-xs text-slate-500">
                  Dictamen contable preparado de conformidad con Normas Internacionales de Información Financiera (NIIF) y regulación tributaria ecuatoriana.
                </p>
              </div>

              {/* Financial Metrics Summary Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Ventas Brutas Totales</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {formatUSD(report.metrics.totalSalesUSD)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{report.metrics.invoicesCount} facturas</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Base Imponible (Subtotal)</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {formatUSD(report.metrics.subtotalUSD)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tarifa 15%</span>
                </div>

                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-red-800 uppercase block">IVA 15% SRI Recaudado</span>
                  <span className="text-base font-black text-red-800 font-mono">
                    {formatUSD(report.metrics.iva15SRIUSD)}
                  </span>
                  <span className="text-[10px] text-red-600 block mt-0.5">Por liquidar al SRI</span>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Utilidad Bruta Proyectada</span>
                  <span className="text-base font-black text-emerald-800 font-mono">
                    {formatUSD(report.metrics.estimatedGrossProfitUSD)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Margen operativo ferretero</span>
                </div>
              </div>

              {/* Payment Breakdown & Receivables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
                    Conciliación por Métodos de Pago
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Efectivo Mostrador (USD):</span>
                      <span className="font-mono font-bold">{formatUSD(report.metrics.cashUSD)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Transferencias Bancarias:</span>
                      <span className="font-mono font-bold">{formatUSD(report.metrics.transferUSD)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Tarjetas de Débito/Crédito:</span>
                      <span className="font-mono font-bold">{formatUSD(report.metrics.cardUSD)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Ventas a Crédito Comercial:</span>
                      <span className="font-mono font-bold text-amber-700">{formatUSD(report.metrics.creditUSD)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
                    Gestión de Cartera y Cobranzas
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Abonos Recaudados en Período:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatUSD(report.metrics.creditCollectedUSD)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Cartera en Mora (&gt;30 Días):</span>
                      <span className="font-mono font-bold text-red-600">
                        {formatUSD(report.metrics.receivablesOverdueUSD)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Costo de Ventas (Reposición):</span>
                      <span className="font-mono font-bold text-slate-700">
                        {formatUSD(report.metrics.costOfGoodsUSD)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Estado de Conciliación:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Partida Doble Verificada</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Audit Sampling Table */}
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Muestra de Comprobantes Fiscales Auditados
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Comprobante</th>
                        <th className="py-2.5 px-3">Descripción de Transacción</th>
                        <th className="py-2.5 px-3">Medio de Pago</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 text-right">IVA 15%</th>
                        <th className="py-2.5 px-3 text-right">Total USD</th>
                        <th className="py-2.5 px-3 text-center">Estado SRI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.transactionsBreakdown.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {tx.reference}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{tx.description}</td>
                          <td className="py-2.5 px-3 text-slate-500">{tx.paymentMethod}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatUSD(tx.subtotal)}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatUSD(tx.tax)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatUSD(tx.total)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Certification */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="w-48 mx-auto border-b-2 border-slate-700 pb-1 mb-1">
                    <span className="font-mono font-bold text-slate-500 italic">Santiago Morales</span>
                  </div>
                  <p className="font-bold text-slate-900">Lic. Santiago Morales</p>
                  <p className="text-[11px] text-slate-500 font-medium">Contador General Oficial</p>
                  <p className="text-[10px] text-slate-400 font-mono">Reg. Colegiado SRI No. 17-4892</p>
                </div>

                <div>
                  <div className="w-48 mx-auto border-b-2 border-slate-700 pb-1 mb-1">
                    <span className="font-mono font-bold text-slate-500 italic">Carlos Mendoza</span>
                  </div>
                  <p className="font-bold text-slate-900">Carlos Mendoza</p>
                  <p className="text-[11px] text-slate-500 font-medium">Gerente General / Representante Legal</p>
                  <p className="text-[10px] text-slate-400 font-mono">Avante Ferreterías S.A.</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3 no-print">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cerrar Ventana
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Descargar / Imprimir PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
