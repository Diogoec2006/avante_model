import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ApiClient } from '../api/client';
import { Users } from 'lucide-react';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-red-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Control de Acceso y Roles (RBAC)
            </h3>
            <p className="text-xs text-slate-500">
              Gestión de credenciales para Administradores, Vendedores de Mostrador y Contadores
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nombre Completo</th>
              <th className="py-3 px-4">Correo Electrónico</th>
              <th className="py-3 px-4">Rol Asignado</th>
              <th className="py-3 px-4 text-center">Permisos Principales</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => {
              const roleColors = {
                ADMIN: 'bg-red-50 text-red-700 border-red-200',
                VENDEDOR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                CONTADOR: 'bg-blue-50 text-blue-700 border-blue-200',
              };

              const roleDescriptions = {
                ADMIN: 'Control total del sistema, ajustes y configuración',
                VENDEDOR: 'POS mostrador, consulta de stock sin costos',
                CONTADOR: 'Libro diario, PUC, Cartera y auditoría financiera',
              };

              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {u.full_name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[u.role]}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-slate-500 font-medium">
                    {roleDescriptions[u.role]}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active !== false
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
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
  );
};
