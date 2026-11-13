import React, { useState, useEffect } from 'react';
import { ProductDemandHeat } from '../types';
import { ApiClient } from '../api/client';
import { formatUSD } from '../utils/format';
import {
  Flame,
  AlertTriangle,
  TrendingUp,
  Package,
  Clock,
  DollarSign,
  Filter,
  CheckCircle2,
  Printer,
} from 'lucide-react';

export const ProductHeatmap: React.FC = () => {
  const [heatData, setHeatData] = useState<ProductDemandHeat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [timeframe, setTimeframe] = useState<'SEMANAL' | 'MENSUAL'>('SEMANAL');

  useEffect(() => {
    loadHeatmap();
  }, [timeframe]);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getProductDemandHeatmap();
      setHeatData(data);
    } catch (err) {
      console.error('Error cargando mapa de calor:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = heatData.filter((item) => {
    if (filterLevel === 'ALL') return true;
    return item.heatLevel === filterLevel;
  });

  const criticalCount = heatData.filter((i) => i.heatLevel === 'CRITICAL_HIGH').length;
  const highCount = heatData.filter((i) => i.heatLevel === 'HIGH').length;
  const moderateCount = heatData.filter((i) => i.heatLevel === 'MODERATE').length;
  const lowCount = heatData.filter((i) => i.heatLevel === 'LOW').length;

  const totalDemandUnits = heatData.reduce((s, i) => s + i.unitsRequested, 0);
  const totalRevenueDemandUSD = heatData.reduce((s, i) => s + i.revenueGeneratedUSD, 0);

  const getHeatBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL_HIGH':
        return {
          bg: 'bg-red-700 text-white border-red-800 shadow-sm shadow-red-700/30',
          label: 'Fuego / Demanda Crítica',
          barColor: 'bg-red-600',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/30',
          label: 'Alta Rotación',
          barColor: 'bg-amber-500',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'Rotación Media',
          barColor: 'bg-amber-400',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'Baja Rotación / Stock Frío',
          barColor: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 bg-red-100 text-red-800 rounded-2xl">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900">
                Mapa de Calor de Demanda y Rotación
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-800 text-white font-black uppercase">
                Auditoría Contable
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Análisis visual de velocidad de rotación, pedidos recurrentes y riesgo de desabastecimiento
            </p>
          </div>
        </div>

        {/* Controls: Timeframe & Print */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setTimeframe('SEMANAL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === 'SEMANAL'
                  ? 'bg-white text-red-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Corte Semanal
            </button>
            <button
              onClick={() => setTimeframe('MENSUAL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === 'MENSUAL'
                  ? 'bg-white text-red-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Corte Mensual
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold border border-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Resumen</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Heat Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md shadow-red-600/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Demanda Crítica / Urgente</p>
            <h3 className="text-xl font-black text-red-700">{criticalCount} Productos</h3>
            <p className="text-[10px] text-red-600 font-semibold mt-0.5">Agotamiento en &lt; 3 días</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Alta Rotación Constante</p>
            <h3 className="text-xl font-black text-amber-700">{highCount} Productos</h3>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Flujo sostenido en mostrador</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Unidades Solicitadas</p>
            <h3 className="text-xl font-black text-blue-700">{totalDemandUnits} UND</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">En el ciclo evaluado</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Valor de la Demanda (USD)</p>
            <h3 className="text-xl font-black text-emerald-700 font-mono">
              {formatUSD(totalRevenueDemandUSD)}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Facturación proyectada</p>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm text-xs font-bold">
        <span className="text-slate-400 flex items-center gap-1.5 pl-2 pr-1">
          <Filter className="w-4 h-4" />
          <span>Filtro de Intensidad:</span>
        </span>

        <button
          onClick={() => setFilterLevel('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterLevel === 'ALL'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({heatData.length})
        </button>

        <button
          onClick={() => setFilterLevel('CRITICAL_HIGH')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            filterLevel === 'CRITICAL_HIGH'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Crítica ({criticalCount})</span>
        </button>

        <button
          onClick={() => setFilterLevel('HIGH')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterLevel === 'HIGH'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          Alta ({highCount})
        </button>

        <button
          onClick={() => setFilterLevel('MODERATE')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterLevel === 'MODERATE'
              ? 'bg-amber-400 text-slate-900 shadow-xs'
              : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          Media ({moderateCount})
        </button>

        <button
          onClick={() => setFilterLevel('LOW')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filterLevel === 'LOW'
              ? 'bg-slate-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Baja ({lowCount})
        </button>
      </div>

      {/* Heatmap Visual Matrix & Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Producto & SKU</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4 text-center">Nivel Térmico</th>
                <th className="py-3.5 px-4 text-center">Velocidad / Tracción</th>
                <th className="py-3.5 px-4 text-center">Existencia vs Mínimo</th>
                <th className="py-3.5 px-4 text-center">Días de Stock Restante</th>
                <th className="py-3.5 px-4 text-right">Recaudación Proyectada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => {
                const badge = getHeatBadge(item.heatLevel);
                const isUnderMin = item.currentStock <= item.minStock;

                return (
                  <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>SKU: {item.sku}</span>
                        <span>·</span>
                        <span>Cód: {item.barcode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.categoryName}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${badge.bg}`}
                      >
                        {item.heatLevel === 'CRITICAL_HIGH' && <Flame className="w-3.5 h-3.5" />}
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-36 mx-auto">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>{item.demandVelocity}% Demanda</span>
                          <span>{item.unitsRequested} unds</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${badge.barColor}`}
                            style={{ width: `${item.demandVelocity}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-800">
                          {item.currentStock}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="font-mono text-slate-500">{item.minStock} min</span>
                      </div>
                      {isUnderMin && (
                        <div className="text-[10px] text-red-600 font-bold flex items-center justify-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Bajo el Mínimo</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                          item.depletionDays <= 2
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : item.depletionDays <= 5
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{item.depletionDays} días</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatUSD(item.revenueGeneratedUSD)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
