import React from 'react';
import { User, Role } from '../types';
import {
  ShoppingCart,
  Package,
  CreditCard,
  BookOpen,
  Users,
  LogOut,
  Flame,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  // Navigation tabs defined strictly per role
  const getTabsForRole = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return [
          { id: 'pos', label: 'Punto de Venta POS', icon: ShoppingCart },
          { id: 'inventory', label: 'Bodega & Inventario', icon: Package },
          { id: 'receivables', label: 'Cartera (CxC)', icon: CreditCard },
          { id: 'accounting', label: 'Contabilidad & Auditoría', icon: BookOpen },
          { id: 'users', label: 'Personal & Delegación', icon: Users },
        ];
      case 'VENDEDOR':
        return [
          { id: 'pos', label: 'Terminal POS (Ventas)', icon: ShoppingCart },
          { id: 'customers', label: 'Mi Cartera de Clientes', icon: UserCheck },
          { id: 'inventory', label: 'Consulta de Stock', icon: Package },
        ];
      case 'CONTADOR':
        return [
          { id: 'accounting', label: 'Contabilidad & Auditorías', icon: BookOpen },
          { id: 'heatmap', label: 'Mapa de Calor de Demanda', icon: Flame },
          { id: 'receivables', label: 'Cartera & Morosidad', icon: CreditCard },
        ];
      case 'ASISTENTE_BODEGA':
        return [
          { id: 'inventory', label: 'Bodega & Control de Stock', icon: Package },
        ];
      default:
        return [
          { id: 'pos', label: 'Punto de Venta POS', icon: ShoppingCart },
        ];
    }
  };

  const visibleTabs = getTabsForRole(user?.role) || [];

  const getRoleBadge = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-50 text-red-800 border-red-300';
      case 'VENDEDOR':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'CONTADOR':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'ASISTENTE_BODEGA':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleTitle = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'VENDEDOR':
        return 'Vendedor Mostrador';
      case 'CONTADOR':
        return 'Contador Oficial';
      case 'ASISTENTE_BODEGA':
        return 'Asistente de Bodega';
      default:
        return 'Colaborador';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Ecuador */}
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white flex items-center justify-center border border-slate-200 shadow-sm p-1.5 shrink-0">
              <img
                src="/logo_avante.avif"
                alt="Logo Avante"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tight text-red-800">
                  AVANTE
                </span>
                <span className="text-[11px] px-2 py-0.5 bg-red-100 text-red-800 rounded-md font-black uppercase tracking-wider">
                  Ecuador · USD $
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">
                Ferretería & Soluciones Técnicas
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Tablet & Desktop touch-friendly */}
          <nav className="hidden md:flex space-x-2">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 min-h-[46px] select-none ${
                    isActive
                      ? 'bg-red-800 text-white shadow-md shadow-red-900/20 ring-1 ring-red-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout (No Role Switching) */}
          <div className="flex items-center space-x-3.5">
            <div className="text-right">
              <div className="text-xs font-black text-slate-900 leading-tight">
                {user.full_name}
              </div>
              <div className="mt-1 flex items-center justify-end">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadge(
                    user.role,
                  )}`}
                >
                  {getRoleTitle(user.role)}
                </span>
              </div>
            </div>

            {/* Red Logout Button with Clear Familiar Function */}
            <button
              onClick={onLogout}
              title="Cerrar sesión segura"
              className="p-3 rounded-2xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-all flex items-center justify-center min-h-[46px] min-w-[46px]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Scrollable Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-3 space-x-2 border-t border-slate-200 no-scrollbar">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};