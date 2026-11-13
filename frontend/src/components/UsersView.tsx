import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { ApiClient } from '../api/client';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  Phone,
  Mail,
  FileCheck2,
  Package,
  ShoppingCart,
  BookOpen,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New User Form State
  const [newUser, setNewUser] = useState<{
    full_name: string;
    email: string;
    password: string;
    role: Role;
    phone: string;
    document_number: string;
  }>({
    full_name: '',
    email: '',
    password: '',
    role: 'VENDEDOR',
    phone: '',
    document_number: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await ApiClient.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await ApiClient.toggleUserStatus(id);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);

    if (!newUser.full_name.trim() || !newUser.email.trim()) {
      setErrorModal('El nombre completo y correo corporativo son obligatorios.');
      return;
    }

    if (newUser.password && newUser.password.length < 6) {
      setErrorModal('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await ApiClient.createUser({
        full_name: newUser.full_name.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password || 'Avante2026*',
        role: newUser.role,
        phone: newUser.phone,
        document_number: newUser.document_number,
      });

      setShowCreateModal(false);
      setNewUser({
        full_name: '',
        email: '',
        password: '',
        role: 'VENDEDOR',
        phone: '',
        document_number: '',
      });
      setSuccessToast(`Usuario delegado con éxito: ${newUser.role}`);
      setTimeout(() => setSuccessToast(null), 4000);
      loadUsers();
    } catch (err: any) {
      setErrorModal(err.message || 'Error al delegar usuario');
    }
  };

  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-300',
    VENDEDOR: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    CONTADOR: 'bg-blue-100 text-blue-800 border-blue-300',
    ASISTENTE_BODEGA: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const roleIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
    ADMIN: ShieldCheck,
    VENDEDOR: ShoppingCart,
    CONTADOR: BookOpen,
    ASISTENTE_BODEGA: Package,
  };

  const roleDescriptions: Record<Role, string> = {
    ADMIN: 'Control total: configuración, creación de usuarios, reportes contables y anulación de facturas.',
    VENDEDOR: 'Punto de venta (POS) táctil y registro exclusivo de sus clientes. Sin acceso a costos ni contabilidad.',
    CONTADOR: 'Contabilidad NIIF, auditorías PDF (diaria/semanal/mensual/anual), cartera y mapa de calor de demanda.',
    ASISTENTE_BODEGA: 'Bodega e inventario: agregar nuevos productos, ajustar y agregar stock, alertas de stock mínimo.',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 bg-red-100 text-red-800 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900">
                Gestión de Personal & Delegación de Funciones
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-black uppercase">
                Administrador General
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Crea y delega usuarios para: Asistente de Bodega, Vendedor Mostrador, Contador Oficial o Administrador
            </p>
          </div>
        </div>

        {/* Button to Delegate / Create User */}
        <button
          onClick={() => {
            setErrorModal(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-red-800 hover:bg-red-900 text-white rounded-2xl text-xs font-black shadow-md shadow-red-900/25 transition-all min-h-[46px]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Delegar Nuevo Usuario</span>
        </button>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Role Summary Cards (Quick overview of delegation hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            role: 'ASISTENTE_BODEGA' as Role,
            name: 'Asistente de Bodega',
            desc: 'Agrega stock, registra nuevos productos y monitorea faltantes.',
            icon: Package,
            color: 'border-amber-200 bg-amber-50/50 text-amber-900',
            badge: 'bg-amber-100 text-amber-800',
          },
          {
            role: 'VENDEDOR' as Role,
            name: 'Vendedor Mostrador',
            desc: 'Emite facturas POS y registra clientes exclusivos para su cartera.',
            icon: ShoppingCart,
            color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
            badge: 'bg-emerald-100 text-emerald-800',
          },
          {
            role: 'CONTADOR' as Role,
            name: 'Contador Oficial',
            desc: 'Auditorías PDF periódicas, mapa de calor y asientos contables.',
            icon: BookOpen,
            color: 'border-blue-200 bg-blue-50/50 text-blue-900',
            badge: 'bg-blue-100 text-blue-800',
          },
          {
            role: 'ADMIN' as Role,
            name: 'Administrador',
            desc: 'Control integral, anulación de facturas y delegación de usuarios.',
            icon: ShieldCheck,
            color: 'border-red-200 bg-red-50/50 text-red-900',
            badge: 'bg-red-100 text-red-800',
          },
        ].map((item) => {
          const Icon = item.icon;
          const count = users.filter((u) => u.role === item.role).length;
          return (
            <div
              key={item.role}
              className={`p-4 border rounded-2xl shadow-xs flex flex-col justify-between ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white rounded-xl shadow-xs">
                    <Icon className="w-4 h-4 text-slate-800" />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badge}`}>
                    {count} activos
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Usuario / Nombre</th>
                <th className="py-3.5 px-4">Correo Corporativo</th>
                <th className="py-3.5 px-4">Rol Delegado</th>
                <th className="py-3.5 px-4">Atribuciones & Módulos</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const RoleIcon = roleIcons[u.role] || Users;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      {u.document_number && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {u.document_number}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${roleColors[u.role]}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{u.role.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-md font-medium leading-relaxed">
                      {roleDescriptions[u.role]}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          u.is_active !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.is_active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${
                          u.is_active !== false
                            ? 'bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {u.is_active !== false ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Delegar / Crear Nuevo Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-100 text-red-800 rounded-2xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Delegar Nuevo Usuario en el Sistema
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asigna permisos de acuerdo al rol operativo de la ferretería
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {errorModal && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Rol a Delegar *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      role: 'ASISTENTE_BODEGA' as Role,
                      label: 'Asistente Bodega',
                      desc: 'Agregar stock y productos',
                      icon: Package,
                    },
                    {
                      role: 'VENDEDOR' as Role,
                      label: 'Vendedor Mostrador',
                      desc: 'POS y cartera propia de clientes',
                      icon: ShoppingCart,
                    },
                    {
                      role: 'CONTADOR' as Role,
                      label: 'Contador Oficial',
                      desc: 'Auditorías PDF y mapa de calor',
                      icon: BookOpen,
                    },
                    {
                      role: 'ADMIN' as Role,
                      label: 'Administrador',
                      desc: 'Gestión total y delegación',
                      icon: ShieldCheck,
                    },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = newUser.role === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setNewUser({ ...newUser, role: r.role })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-red-800 text-white border-red-800 shadow-md shadow-red-900/20'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-black text-xs mb-0.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{r.label}</span>
                        </div>
                        <p
                          className={`text-[10px] leading-tight ${
                            isSelected ? 'text-red-100' : 'text-slate-400'
                          }`}
                        >
                          {r.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marco Vinicio Villacís"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                    Correo Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@avante.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña Inicial *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                    Cédula / Documento (Ecuador)
                  </label>
                  <input
                    type="text"
                    placeholder="1712345678"
                    value={newUser.document_number}
                    onChange={(e) => setNewUser({ ...newUser, document_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono Móvil
                  </label>
                  <input
                    type="text"
                    placeholder="0998765432"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">Nota de Delegación: </span>
                Al guardar, la cuenta se creará inmediatamente y el colaborador podrá iniciar sesión en tablets o computadoras con su correo y contraseña asignada.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md shadow-emerald-600/30 transition-all"
                >
                  Guardar y Delegar Credencial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};