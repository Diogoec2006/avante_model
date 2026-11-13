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

  const handleSwitchRole = (role: Role) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem('avante_current_user', JSON.stringify(updated));
    setDefaultTabForRole(role);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
        Cargando sistema Avante...
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
        onSwitchRole={handleSwitchRole}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'pos' && (currentUser.role === 'ADMIN' || currentUser.role === 'VENDEDOR') && (
          <PosView />
        )}

        {activeTab === 'inventory' && (
          <InventoryView userRole={currentUser.role} />
        )}

        {activeTab === 'receivables' && (currentUser.role === 'ADMIN' || currentUser.role === 'CONTADOR') && (
          <ReceivablesView />
        )}

        {activeTab === 'accounting' && (currentUser.role === 'ADMIN' || currentUser.role === 'CONTADOR') && (
          <AccountingView />
        )}

        {activeTab === 'users' && currentUser.role === 'ADMIN' && (
          <UsersView />
        )}
      </main>
    </div>
  );
};

export default App;
