import React from 'react';
import { User, Role } from '../types';
import {
  ShoppingCart,
  Package,
  CreditCard,
  BookOpen,
  Users,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSwitchRole: (role: Role) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchRole,
}) => {
  const tabs = [
    {
      id: 'pos',
      label: 'Punto de Venta (POS)',
      icon: ShoppingCart,
      roles: ['ADMIN', 'VENDEDOR'],
    },
    {
      id: 'inventory',
      label: 'Bodega e Inventario',
      icon: Package,
      roles: ['ADMIN', 'VENDEDOR', 'CONTADOR'],
    },
    {
      id: 'receivables',
      label: 'Cartera (CxC)',
      icon: CreditCard,
      roles: ['ADMIN', 'CONTADOR'],
    },
    {
      id: 'accounting',
      label: 'Contabilidad (NIIF)',
      icon: BookOpen,
      roles: ['ADMIN', 'CONTADOR'],
    },
    {
      id: 'users',
      label: 'Usuarios y RBAC',
      icon: Users,
      roles: ['ADMIN'],
    },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(user.role));

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'VENDEDOR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONTADOR':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Ecuador */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-200 shadow-xs p-1">
              <img
                src="/logo_avante.avif"
                alt="Logo Avante"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-tight text-red-700">
                  AVANTE
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-800 rounded-md font-bold uppercase tracking-wider">
                  Ecuador USD
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Ferretería & Soluciones Técnicas
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Well Distributed */}
          <nav className="hidden md:flex space-x-2">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User info & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher Buttons */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500 font-bold px-1.5">
                Rol:
              </span>
              {(['ADMIN', 'VENDEDOR', 'CONTADOR'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onSwitchRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    user.role === r
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800 leading-none">
                  {user.full_name?.split(' ')[0]}
                </div>
                <div className="mt-1">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadge(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Red Logout Button */}
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t border-slate-200">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                  isActive
                    ? 'bg-red-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
