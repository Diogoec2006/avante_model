import React, { useState } from 'react';
import { ApiClient } from '../api/client';
import { User } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('admin@avante.com');
  const [password, setPassword] = useState<string>('Admin123*');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await ApiClient.login(email, password);
      onLoginSuccess(data.user, data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.login(userEmail, userPass);
      onLoginSuccess(data.user, data.accessToken);
    } catch (err: any) {
      setError(err.message || 'Error al ingresar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Avante Logo & Branding Ecuador */}
        <div className="flex justify-center mb-3">
          <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-lg">
            <img
              src="/logo_avante.avif"
              alt="Logo Avante"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-red-700">
          AVANTE FERRETERÍAS
        </h1>
        <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Ecuador · Sistema de Gestión POS (USD) · SRI
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Large, Ergonomic 1-Click Role Selector Cards */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider text-center">
              Selecciona tu Perfil de Ingreso (1 Clic)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectRole('admin@avante.com', 'Admin123*')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400 text-red-800 transition-all text-center shadow-xs group"
              >
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 mb-1.5 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-red-700" />
                </div>
                <span className="text-xs font-black">Admin</span>
                <span className="text-[10px] text-red-600 font-semibold mt-0.5">Control Total</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('vendedor@avante.com', 'Vendedor123*')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 text-emerald-800 transition-all text-center shadow-xs group"
              >
                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 mb-1.5 transition-colors">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <span className="text-xs font-black">Vendedor</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">POS Mostrador</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('contador@avante.com', 'Contador123*')}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-800 transition-all text-center shadow-xs group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 mb-1.5 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-blue-700" />
                </div>
                <span className="text-xs font-black">Contador</span>
                <span className="text-[10px] text-blue-600 font-semibold mt-0.5">Cartera / SRI</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              O ingresa credenciales
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@avante.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Well-sized Green Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-400 font-medium">
            Ferretería Avante Cía. Ltda. &copy; 2026 · Quito, Ecuador
          </div>
        </div>
      </div>
    </div>
  );
};
