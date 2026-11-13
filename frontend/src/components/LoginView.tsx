import React, { useState } from 'react';
import { ApiClient } from '../api/client';
import { User } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';

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

  const handleFillCredentials = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Avante Logo & Branding Ecuador */}
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 rounded-3xl bg-white border border-slate-200 p-3 flex items-center justify-center shadow-xl shadow-slate-300/40">
            <img
              src="/logo_avante.avif"
              alt="Logo Avante Ferreterías"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-red-800">
          AVANTE FERRETERÍAS
        </h1>
        <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Ecuador · Sistema Integrado ERP / POS (USD $) · SRI
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-4 text-center">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Acceso Seguro al Portal Institucional
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa tus credenciales corporativas asignadas
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold block">Fallo de Autenticación</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form optimized for Touch & Tablets */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@avante.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 h-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña de Acceso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-12 pr-4 h-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Familiar Green/Emerald Button for Affirmative Action (Ingreso) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center space-x-2.5 rounded-2xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Validando credenciales en servidor...</span>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Discreet Credentials Helper for Demonstration */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-700" />
              <span>Cuentas por Perfil para Pruebas:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleFillCredentials('admin@avante.com', 'Admin123*')}
                className="p-2 bg-white hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="font-black text-red-800">1. Administrador</div>
                <div className="text-[10px] text-slate-500 font-mono">admin@avante.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('vendedor@avante.com', 'Vendedor123*')}
                className="p-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="font-black text-emerald-800">2. Vendedor</div>
                <div className="text-[10px] text-slate-500 font-mono">vendedor@avante.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('contador@avante.com', 'Contador123*')}
                className="p-2 bg-white hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="font-black text-blue-800">3. Contador</div>
                <div className="text-[10px] text-slate-500 font-mono">contador@avante.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('bodega@avante.com', 'Bodega123*')}
                className="p-2 bg-white hover:bg-amber-50 hover:border-amber-200 border border-slate-200 rounded-xl text-left transition-colors"
              >
                <div className="font-black text-amber-800">4. Asistente Bodega</div>
                <div className="text-[10px] text-slate-500 font-mono">bodega@avante.com</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              (Haz clic en cualquier cuenta para autocompletar el formulario de ingreso)
            </p>
          </div>

          <div className="pt-1 text-center text-[11px] text-slate-400 font-medium flex items-center justify-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Avante Ferreterías S.A. &copy; 2026 · Quito, Ecuador</span>
          </div>
        </div>
      </div>
    </div>
  );
};