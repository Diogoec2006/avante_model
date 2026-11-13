import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import { ApiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { ReceivablesView } from './components/ReceivablesView';
import { AccountingView } from './components/AccountingView';
import { UsersView } from './components/UsersView';
import { SellerCustomersView } from './components/SellerCustomersView';
import { ProductHeatmap } from './components/ProductHeatmap';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('avante_token');
    if (token) {
      ApiClient.getProfile()
        .then((user) => {
          setCurrentUser(user);
          setDefaultTabForRole(user.role);
        })
        .catch(() => {
          localStorage.removeItem('avante_token');
          setCurrentUser(null);
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const setDefaultTabForRole = (role: Role) => {
    switch (role) {
      case 'ADMIN':
      case 'VENDEDOR':
        setActiveTab('pos');
        break;
      case 'CONTADOR':
        setActiveTab('accounting');
        break;
      case 'ASISTENTE_BODEGA':
        setActiveTab('inventory');
        break;
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setDefaultTabForRole(user.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('avante_token');
    localStorage.removeItem('avante_current_user');
    setCurrentUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
        Cargando sistema Avante Ecuador...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 pb-12">
        {/* Module 1: POS Mostrador (VENDEDOR & ADMIN) */}
        {activeTab === 'pos' && (currentUser.role === 'ADMIN' || currentUser.role === 'VENDEDOR') && (
          <PosView currentUser={currentUser} />
        )}

        {/* Module 2: Cartera Exclusiva de Clientes del Vendedor (VENDEDOR & ADMIN) */}
        {activeTab === 'customers' && (currentUser.role === 'ADMIN' || currentUser.role === 'VENDEDOR') && (
          <SellerCustomersView currentUser={currentUser} />
        )}

        {/* Module 3: Bodega & Inventario (ASISTENTE_BODEGA, ADMIN, VENDEDOR) */}
        {activeTab === 'inventory' && (
          <InventoryView userRole={currentUser.role} />
        )}

        {/* Module 4: Mapa de Calor de Demanda (CONTADOR & ADMIN) */}
        {activeTab === 'heatmap' && (currentUser.role === 'ADMIN' || currentUser.role === 'CONTADOR') && (
          <ProductHeatmap />
        )}

        {/* Module 5: Cartera CxC (ADMIN & CONTADOR) */}
        {activeTab === 'receivables' && (currentUser.role === 'ADMIN' || currentUser.role === 'CONTADOR') && (
          <ReceivablesView />
        )}

        {/* Module 6: Contabilidad & Auditorías SRI (ADMIN & CONTADOR) */}
        {activeTab === 'accounting' && (currentUser.role === 'ADMIN' || currentUser.role === 'CONTADOR') && (
          <AccountingView />
        )}

        {/* Module 7: Personal & Delegación de Roles (ADMIN Únicamente) */}
        {activeTab === 'users' && currentUser.role === 'ADMIN' && (
          <UsersView />
        )}
      </main>
    </div>
  );
};

export default App;