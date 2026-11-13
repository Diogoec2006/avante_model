import React, { useState, useEffect } from 'react';
import { Customer, User } from '../types';
import { ApiClient } from '../api/client';
import { formatUSD } from '../utils/format';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Lock,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SellerCustomersViewProps {
  currentUser: User;
}

export const SellerCustomersView: React.FC<SellerCustomersViewProps> = ({ currentUser }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<Customer | null>(null);
  const [contactNote, setContactNote] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    document_type: 'RUC',
    document_number: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: 1000,
  });
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [currentUser]);

  const loadCustomers = async () => {
    try {
      const data = await ApiClient.getCustomers(
        currentUser.role === 'VENDEDOR' ? currentUser.id : undefined,
      );
      setCustomers(data);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);

    if (newCustomer.document_type === 'RUC' && newCustomer.document_number.length !== 13) {
      setErrorModal('El RUC en Ecuador debe contener exactamente 13 dígitos numéricos.');
      return;
    }
    if (newCustomer.document_type === 'CÉDULA' && newCustomer.document_number.length !== 10) {
      setErrorModal('La Cédula en Ecuador debe contener exactamente 10 dígitos numéricos.');
      return;
    }

    try {
      await ApiClient.createCustomer({
        ...newCustomer,
        assigned_seller_id: currentUser.id,
        assigned_seller_name: currentUser.full_name,
        credit_limit: Number(newCustomer.credit_limit),
      });

      setShowCreateModal(false);
      setNewCustomer({
        document_type: 'RUC',
        document_number: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        credit_limit: 1000,
      });
      setSuccessMessage('¡Cliente registrado con éxito y atribuido de forma exclusiva a tu cartera!');
      setTimeout(() => setSuccessMessage(null), 4000);
      loadCustomers();
    } catch (err: any) {
      setErrorModal(err.message || 'Error al registrar cliente');
    }
  };

  const handleSaveContactNote = (c: Customer) => {
    if (!contactNote.trim()) return;
    c.handoff_notes = (c.handoff_notes ? c.handoff_notes + ' | ' : '') + `[${new Date().toLocaleDateString('es-EC')}] ${contactNote}`;
    setShowContactModal(null);
    setContactNote('');
    setSuccessMessage(`Acercamiento comercial registrado con éxito para ${c.name}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const myClients = customers.filter(
    (c) => c.assigned_seller_id === currentUser.id,
  );
  const totalDebtMyClients = myClients.reduce((sum, c) => sum + Number(c.current_debt), 0);
  const totalLimitMyClients = myClients.reduce((sum, c) => sum + Number(c.credit_limit), 0);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.document_number.includes(searchTerm) ||
      (c.phone && c.phone.includes(searchTerm)),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & KPI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900">
                Mi Cartera Exclusiva de Clientes
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black uppercase">
                Atribución Comercial
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tus clientes registrados son exclusivos: ningún otro vendedor puede facturarles ni acceder a ellos
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-red-800 hover:bg-red-900 text-white rounded-2xl text-xs font-black shadow-md shadow-red-900/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2 font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Clientes Exclusivos Asignados</p>
          <h3 className="text-xl font-black text-slate-900 mt-1">{myClients.length} Clientes</h3>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Cartera fidelizada propia</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Cupo de Crédito Total Asignado</p>
          <h3 className="text-xl font-black text-blue-700 font-mono mt-1">
            {formatUSD(totalLimitMyClients)}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Línea aprobada a tus clientes</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase">Saldo Pendiente de Cobro</p>
          <h3 className="text-xl font-black text-amber-700 font-mono mt-1">
            {formatUSD(totalDebtMyClients)}
          </h3>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">En gestión de cobranza</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente por RUC, Cédula, Razón Social o Teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 shadow-sm"
        />
      </div>

      {/* Customers Cards Grid (Optimized for Tablets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isGeneric = c.document_number === '9999999999';
          const isMine = c.assigned_seller_id === currentUser.id;

          return (
            <div
              key={c.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isMine
                  ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-black text-slate-500 uppercase px-2 py-0.5 bg-slate-100 rounded-md">
                    {c.document_type}: {c.document_number}
                  </span>

                  {isGeneric ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
                      Venta General
                    </span>
                  ) : isMine ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Lock className="w-3 h-3" />
                      <span>Exclusivo Tuyo</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                      Asignado
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-slate-900 line-clamp-1 mb-2">
                  {c.name}
                </h4>

                <div className="space-y-1 text-xs text-slate-600 mb-3">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                {/* Credit status box */}
                {!isGeneric && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Cupo Aprobado:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatUSD(c.credit_limit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Deuda Actual:</span>
                      <span className="font-mono font-bold text-red-600">
                        {formatUSD(c.current_debt)}
                      </span>
                    </div>
                  </div>
                )}

                {c.handoff_notes && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                    <span className="font-bold block text-[10px] text-amber-800 uppercase">
                      Notas de Acercamiento Comercial:
                    </span>
                    <span>{c.handoff_notes}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {!isGeneric && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowContactModal(c);
                      setContactNote('');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Registrar Contacto</span>
                  </button>

                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cartera Protegida</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Registrar Nuevo Cliente para el Vendedor */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Registrar Nuevo Cliente en Mi Cartera
                </h3>
                <p className="text-xs text-slate-500">
                  El cliente quedará bloqueado exclusivamente a tu usuario vendedor
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {errorModal && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={newCustomer.document_type}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, document_type: e.target.value })
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
                    value={newCustomer.document_number}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, document_number: e.target.value })
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
                  placeholder="Ej: Constructora Andina Cía. Ltda."
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
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
                    placeholder="0998765432"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cupo de Crédito Solicitado (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newCustomer.credit_limit}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        credit_limit: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correo Electrónico (Facturación Electrónica SRI)
                </label>
                <input
                  type="email"
                  placeholder="compras@empresa.ec"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dirección en Ecuador
                </label>
                <input
                  type="text"
                  placeholder="Av. Amazonas y Colón, Quito"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  Atribución directa a tu usuario vendedor: <strong>{currentUser.full_name}</strong>
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirmar y Asignar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Contacto / Acercamiento Comercial */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Contacto Comercial Fuera de Transacción
                </h3>
                <p className="text-xs text-slate-500">
                  {showContactModal.name} ({showContactModal.document_number})
                </p>
              </div>
              <button
                onClick={() => setShowContactModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">
                Detalle del Acercamiento / Visita / Llamada:
              </label>
              <textarea
                rows={4}
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                placeholder="Ej: Se realizó visita técnica en obra sur. El maestro cotizó tubería PVC Plastigama para la próxima semana..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-800 text-xs focus:outline-none focus:border-red-600 font-medium"
              ></textarea>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveContactNote(showContactModal)}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl shadow-md"
                >
                  Guardar Acercamiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
