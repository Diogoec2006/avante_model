import React, { useState, useEffect } from 'react';
import { JournalEntry, AccountingAccount } from '../types';
import { ApiClient } from '../api/client';
import { formatUSD } from '../utils/format';
import {
  BookOpen,
  Plus,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Scale,
} from 'lucide-react';

export const AccountingView: React.FC = () => {
  const [subTab, setSubTab] = useState<'journal' | 'chart'>('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Manual Entry Form
  const [concept, setConcept] = useState<string>('');
  const [manualLines, setManualLines] = useState<
    { account_id: string; debit: number; credit: number; description: string }[]
  >([
    { account_id: '', debit: 0, credit: 0, description: '' },
    { account_id: '', debit: 0, credit: 0, description: '' },
  ]);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [journal, chart, sum] = await Promise.all([
        ApiClient.getJournalEntries(),
        ApiClient.getChartOfAccounts(),
        ApiClient.getFinancialSummary(),
      ]);
      setEntries(journal);
      setAccounts(chart);
      setSummary(sum);
      if (chart.length >= 2 && !manualLines[0].account_id) {
        setManualLines([
          { account_id: chart[0].id, debit: 0, credit: 0, description: '' },
          { account_id: chart[1].id, debit: 0, credit: 0, description: '' },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalDebitManual = manualLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCreditManual = manualLines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebitManual - totalCreditManual) < 0.01 && totalDebitManual > 0;

  const handleCreateManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      setErrorModal('El asiento contable no cumple con el principio de Partida Doble (Débito ≠ Crédito).');
      return;
    }

    try {
      await ApiClient.createJournalEntry({
        concept,
        lines: manualLines.map((l) => ({
          account_id: l.account_id,
          debit: Number(l.debit),
          credit: Number(l.credit),
          description: l.description || concept,
        })),
      });
      setShowManualModal(false);
      setConcept('');
      loadData();
    } catch (err: any) {
      setErrorModal(err.message || 'Error guardando asiento');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Financial KPI Summary Cards (USD) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Ingresos Totales por Ventas (USD)</p>
          <h3 className="text-xl font-black text-emerald-700 font-mono mt-1">
            {formatUSD(summary?.totalSalesRevenue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Cuenta 4.1.01.01 (Ventas)</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Saldo en Caja Mostrador (USD)</p>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatUSD(summary?.cashInHand)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Cuenta 1.1.01.01 (Caja General)</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Cartera Activa por Cobrar (USD)</p>
          <h3 className="text-xl font-black text-blue-700 font-mono mt-1">
            {formatUSD(summary?.accountsReceivable)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Cuenta 1.1.02.01 (Clientes)</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">IVA en Ventas por Pagar (15% SRI)</p>
          <h3 className="text-xl font-black text-amber-700 font-mono mt-1">
            {formatUSD(summary?.taxPayable)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Cuenta 2.1.07.01 (Pasivo Fiscal)</p>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setSubTab('journal')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'journal'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Libro Diario (Asientos Contables)</span>
          </button>

          <button
            onClick={() => setSubTab('chart')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'chart'
                ? 'bg-red-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Plan de Cuentas (Normas NIIF Ecuador)</span>
          </button>
        </div>

        {subTab === 'journal' && (
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Asiento Manual</span>
          </button>
        )}
      </div>

      {/* View 1: Journal Entries */}
      {subTab === 'journal' && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              No hay asientos registrados en el libro diario.
            </div>
          ) : (
            entries.map((entry) => {
              const totalDebit = entry.lines?.reduce((s, l) => s + Number(l.debit), 0) || 0;
              const totalCredit = entry.lines?.reduce((s, l) => s + Number(l.credit), 0) || 0;

              return (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-black text-sm text-red-700">
                        {entry.entry_number}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {entry.concept}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {entry.source_module}
                      </span>
                      <span>Fecha: {entry.entry_date}</span>
                    </div>
                  </div>

                  {/* Lines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="py-2 px-3">Cuenta Contable</th>
                          <th className="py-2 px-3">Descripción Movimiento</th>
                          <th className="py-2 px-3 text-right">Débito USD</th>
                          <th className="py-2 px-3 text-right">Crédito USD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {entry.lines?.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2 px-3 font-mono">
                              <span className="font-bold text-slate-800">
                                {line.account?.code}
                              </span>{' '}
                              - {line.account?.name}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {line.description}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              {Number(line.debit) > 0 ? formatUSD(line.debit) : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                              {Number(line.credit) > 0 ? formatUSD(line.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t border-slate-200 font-bold font-mono text-xs bg-slate-50">
                        <tr>
                          <td colSpan={2} className="py-2 px-3 text-right text-slate-600">
                            Sumas Iguales (Partida Doble USD):
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-700 font-black">
                            {formatUSD(totalDebit)}
                          </td>
                          <td className="py-2 px-3 text-right text-blue-700 font-black">
                            {formatUSD(totalCredit)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Chart of Accounts */}
      {subTab === 'chart' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-800">
              Catálogo de Cuentas Contables (Adaptado a Ferretería en Ecuador - NIIF)
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Código Cuenta</th>
                <th className="py-3 px-4">Nombre de la Cuenta</th>
                <th className="py-3 px-4">Naturaleza / Tipo</th>
                <th className="py-3 px-4 text-center">Nivel</th>
                <th className="py-3 px-4 text-center">Permite Movimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-red-700">
                    {acc.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {acc.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {acc.account_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-mono">
                    {acc.level}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-emerald-700 font-bold">Sí</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Scale className="w-5 h-5 text-red-700" />
              <span>Registrar Comprobante de Diario Manual (USD)</span>
            </h3>

            {errorModal && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCreateManualEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Concepto del Asiento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pago de arriendo local o servicios básicos (USD)"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">
                  Líneas de Movimiento (Partida Doble)
                </label>

                {manualLines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <select
                        value={line.account_id}
                        onChange={(e) => {
                          const updated = [...manualLines];
                          updated[idx].account_id = e.target.value;
                          setManualLines(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                      >
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Débito USD"
                        value={line.debit}
                        onChange={(e) => {
                          const updated = [...manualLines];
                          updated[idx].debit = Number(e.target.value);
                          if (Number(e.target.value) > 0) updated[idx].credit = 0;
                          setManualLines(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Crédito USD"
                        value={line.credit}
                        onChange={(e) => {
                          const updated = [...manualLines];
                          updated[idx].credit = Number(e.target.value);
                          if (Number(e.target.value) > 0) updated[idx].debit = 0;
                          setManualLines(updated);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      {manualLines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setManualLines(manualLines.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800 font-bold text-base"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setManualLines([
                      ...manualLines,
                      { account_id: accounts[0]?.id || '', debit: 0, credit: 0, description: '' },
                    ])
                  }
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold underline mt-1"
                >
                  + Agregar línea
                </button>
              </div>

              {/* Total Check */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-mono font-bold">
                <div>
                  <span className="text-slate-500 mr-2">Total Débito:</span>
                  <span className="text-emerald-700">{formatUSD(totalDebitManual)}</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-2">Total Crédito:</span>
                  <span className="text-blue-700">{formatUSD(totalCreditManual)}</span>
                </div>
                <div>
                  {isBalanced ? (
                    <span className="text-emerald-700 flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Cuadrado</span>
                    </span>
                  ) : (
                    <span className="text-red-600">Descuadrado</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/30 disabled:opacity-50"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
