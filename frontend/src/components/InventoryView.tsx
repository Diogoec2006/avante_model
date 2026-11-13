import React, { useState, useEffect } from 'react';
import { Product, Category, Role } from '../types';
import { ApiClient } from '../api/client';
import { StockAdjustModal } from './StockAdjustModal';
import { KardexModal } from './KardexModal';
import { formatUSD } from '../utils/format';
import {
  Package,
  AlertTriangle,
  Plus,
  History,
  Sliders,
  DollarSign,
  Search,
  EyeOff,
} from 'lucide-react';

interface InventoryViewProps {
  userRole: Role;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [kardexProduct, setKardexProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New product form (USD Ecuador)
  const [newProduct, setNewProduct] = useState({
    sku: '',
    barcode: '',
    name: '',
    category_id: '',
    unit_of_measure: 'UND',
    cost_price: 0,
    sale_price: 0,
    initial_stock: 0,
    min_stock: 5,
    tax_rate: 15.0, // 15% Ecuador
  });

  useEffect(() => {
    loadData();
  }, [userRole]);

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        ApiClient.getProducts(),
        ApiClient.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !newProduct.category_id) {
        setNewProduct((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createProduct({
        ...newProduct,
        cost_price: Number(newProduct.cost_price),
        sale_price: Number(newProduct.sale_price),
        initial_stock: Number(newProduct.initial_stock),
        min_stock: Number(newProduct.min_stock),
        tax_rate: Number(newProduct.tax_rate),
      });
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creando producto');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? p.category_id === selectedCategory
      : true;

    const matchesLowStock = onlyLowStock
      ? p.current_stock <= p.min_stock
      : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.current_stock <= p.min_stock).length;
  const totalStockItems = products.reduce((sum, p) => sum + Number(p.current_stock), 0);
  const totalValuationUSD = products.reduce(
    (sum, p) => sum + (p.cost_price ? Number(p.cost_price) * Number(p.current_stock) : 0),
    0,
  );

  const isSeller = userRole === 'VENDEDOR';
  const isWarehouseAssistant = userRole === 'ASISTENTE_BODEGA';
  const canManageInventory = userRole === 'ADMIN' || userRole === 'ASISTENTE_BODEGA';
  const hideCostPrice = isSeller;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top KPI Cards in White & Plomito */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Catálogo de Productos Ferreteros</p>
            <h3 className="text-xl font-black text-slate-900">{products.length} Referencias</h3>
            <p className="text-[11px] text-slate-500 font-medium">{totalStockItems} unidades en bodega</p>
          </div>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-4 border rounded-2xl shadow-sm flex items-center space-x-4 cursor-pointer transition-all ${
            onlyLowStock
              ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300 text-slate-900'
          }`}
        >
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Alertas de Stock Mínimo (Ecuador)</p>
            <h3 className="text-xl font-black text-amber-700">{lowStockCount} Productos</h3>
            <p className="text-[11px] text-amber-600 font-bold underline">
              {onlyLowStock ? 'Quitar filtro de escasez' : 'Filtrar productos escasos'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Valoración Total en Bodega (USD)</p>
            {isSeller ? (
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mt-1">
                <EyeOff className="w-4 h-4" />
                <span className="italic">Oculto a rol Vendedor</span>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-blue-700 font-mono">
                  {formatUSD(totalValuationUSD)}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Costo de reposición en Dólares</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descripción, código de barras o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-medium"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button: Nuevo Producto (Permitido a ADMIN y ASISTENTE_BODEGA) */}
        {canManageInventory && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-red-800 hover:bg-red-900 text-white rounded-2xl text-xs font-bold shadow-md shadow-red-900/25 transition-all shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">SKU / Código</th>
                <th className="py-3 px-4">Descripción del Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Stock / Mín</th>
                {!isSeller && <th className="py-3 px-4 text-right">Costo Compra USD</th>}
                <th className="py-3 px-4 text-right">Precio Venta USD</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((p) => {
                const isLow = p.current_stock <= p.min_stock;
                const isZero = p.current_stock <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{p.sku}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.barcode}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 max-w-xs">
                      {p.name}
                      <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                        ({p.unit_of_measure})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.category?.name || 'General'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                          isZero
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {p.current_stock} / {p.min_stock}
                      </span>
                    </td>
                    {!isSeller && (
                      <td className="py-3 px-4 text-right font-mono text-slate-600 font-semibold">
                        {formatUSD(p.cost_price)}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-mono font-black text-red-700 text-sm">
                      {formatUSD(p.sale_price)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {canManageInventory && (
                          <button
                            onClick={() => setAdjustProduct(p)}
                            title="Agregar o ajustar existencias en bodega"
                            className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center transition-all shadow-xs"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setKardexProduct(p)}
                          title="Ver kárdex de movimientos"
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustModal
        product={adjustProduct}
        onClose={() => setAdjustProduct(null)}
        onSuccess={loadData}
      />

      <KardexModal
        product={kardexProduct}
        onClose={() => setKardexProduct(null)}
      />

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Registrar Nuevo Producto Ferretero (USD)
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: HERR-005"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Código de Barras</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 786123456099"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Llave Ajustable 10 Pulgadas Acero Cromo"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Categoría</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-red-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unidad de Medida</label>
                  <select
                    value={newProduct.unit_of_measure}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_of_measure: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-red-600"
                  >
                    <option value="UND">Unidad (UND)</option>
                    <option value="METRO">Metro Lineal</option>
                    <option value="KG">Kilogramo (KG)</option>
                    <option value="GALÓN">Galón</option>
                    <option value="CAJA">Caja</option>
                    <option value="LATA">Lata</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Costo Compra ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-red-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Precio Venta ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newProduct.sale_price}
                    onChange={(e) => setNewProduct({ ...newProduct, sale_price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-red-700 font-bold focus:bg-white focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.initial_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, initial_stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
