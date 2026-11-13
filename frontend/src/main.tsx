import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (err: any) {
    console.error('Fatal mount error in Avante ERP:', err);
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: sans-serif; padding: 1.5rem;">
        <div style="background: white; border-radius: 1.5rem; padding: 2rem; border: 1px solid #e2e8f0; max-width: 450px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <h2 style="color: #991b1b; font-weight: 900; margin-bottom: 0.5rem;">Error de Inicialización</h2>
          <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.5rem;">${err?.message || err}</p>
          <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" style="background: #991b1b; color: white; border: none; padding: 12px 24px; border-radius: 1rem; font-weight: bold; cursor: pointer;">
            Limpiar Caché y Recargar
          </button>
        </div>
      </div>
    `;
  }
}
