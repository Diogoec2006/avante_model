import React, { useState, useEffect } from 'react';
import { ReceivableAccount } from '../types';
import { ApiClient } from '../api/client';
import { PaymentModal } from './PaymentModal';
import { formatUSD } from '../utils/format';
import {
  CreditCard,
  Clock,
  DollarSign,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

export const ReceivablesView: React.FC = () => {
  const [accounts, setAccounts] = useState<ReceivableAccount[]>([]);
  const [agingSummary, setAgingSummary] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<ReceivableAccount | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accs, aging] = await Promise.all([
        ApiClient.getReceivableAccounts(),
        ApiClient.getAgingReport(),
      ]);
      setAccounts(accs);
      setAgingSummary(aging.summary);
    } catch (err) {
      console.error(err);
    }
  };

  const totalReceivables = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const pendingAccounts = accounts.filter((a) => Number(a.balance) > 0);

  const getStatusBadge = (acc: ReceivableAccount) => {
    const isOverdue = new Date(acc.due_date).getTime() < Date.now() && Number(acc.balance) > 0;
    if (Number(acc.balance) === 0) {
      return { label: 'Pagada', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    if (isOverdue) {
      return { label: 'En Mora', bg: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (acc.status === 'PARTIALLY_PAID') {
      return { label: 'Abonada', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { label: 'Al Día', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top KPI Cards in USD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Cartera Activa por Cobrar (USD)</p>
            <h3 className="text-xl font-black text-slate-900 font-mono">
              {formatUSD(totalReceivables)}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">{pendingAccounts.length} facturas con saldo</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Cartera Vencida (&gt;30 días)</p>
            <h3 className="text-xl font-black text-red-700 font-mono">
              {formatUSD(
                (agingSummary?.days31_60 || 0) +
                (agingSummary?.days61_90 || 0) +
                (agingSummary?.moreThan90 || 0),
              )}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Gestión de cobranza activa</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Cupo Global Autorizado (Ecuador)</p>
            <h3 className="text-xl font-black text-emerald-700 font-mono">{formatUSD(6500)}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Constructores y maestros calificados</p>
          </div>
        </div>
      </div>

      {/* Aging Report Summary Bar in USD */}
      {agingSummary && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-red-700" />
              <span>Distribución de Cartera por Edades (Aging Report - USD)</span>
            </h4>
            <span className="text-[11px] text-slate-500 font-mono font-bold">
              Base Total: {formatUSD(agingSummary.totalReceivables)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Al Día (Sin Vencer)</span>
              <p className="text-sm font-black text-emerald-700 font-mono mt-1">
                {formatUSD(agingSummary.current)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">1 a 30 Días</span>
              <p className="text-sm font-black text-blue-700 font-mono mt-1">
                {formatUSD(agingSummary.days1_30)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">31 a 60 Días</span>
              <p className="text-sm font-black text-amber-700 font-mono mt-1">
                {formatUSD(agingSummary.days31_60)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">61 a 90 Días</span>
              <p className="text-sm font-black text-orange-700 font-mono mt-1">
                {formatUSD(agingSummary.days61_90)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">&gt; 90 Días (Crítico)</span>
              <p className="text-sm font-black text-red-700 font-mono mt-1">
                {formatUSD(agingSummary.moreThan90)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Receivables Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-red-700" />
            <span>Cuentas por Cobrar a Clientes (Ecuador)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {accounts.length} facturas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cliente / RUC - Cédula</th>
                <th className="py-3 px-4">Factura Origen</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Monto Original USD</th>
                <th className="py-3 px-4 text-right">Saldo Pendiente USD</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {accounts.map((acc) => {
                const badge = getStatusBadge(acc);
                const hasBalance = Number(acc.balance) > 0;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{acc.customer?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {acc.customer?.document_type}: {acc.customer?.document_number}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {acc.invoice?.invoice_number || 'Crédito'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {acc.due_date}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 font-semibold">
                      {formatUSD(acc.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-red-700 text-sm">
                      {formatUSD(acc.balance)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasBalance ? (
                        <button
                          onClick={() => setSelectedAccount(acc)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all"
                        >
                          Abonar
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-semibold">Al día</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onSuccess={loadData}
      />
    </div>
  );
};
