import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
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

// Error Boundary to prevent any blank screen in the browser
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error no capturado en la aplicación Avante:', error, errorInfo);
  }

  public handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Avante Ferreterías - Recuperación de Interfaz
            </h2>
            <p className="text-xs text-slate-600">
              Se detectó un desfase con los datos en caché del navegador.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 bg-red-800 hover:bg-red-900 text-white rounded-2xl text-xs font-black shadow-md transition-all"
            >
              Reiniciar Sesión y Cargar Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('avante_token');
      const userStr = localStorage.getItem('avante_current_user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          setCurrentUser(user);
          setDefaultTabForRole(user.role);
          setCheckingAuth(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Error recuperando sesión:', e);
    }

    localStorage.removeItem('avante_token');
    localStorage.removeItem('avante_current_user');
    setCurrentUser(null);
    setCheckingAuth(false);
  }, []);

  const setDefaultTabForRole = (role?: Role) => {
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
      default:
        setActiveTab('pos');
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

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;