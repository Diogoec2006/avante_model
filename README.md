# Sistema de Gestión Ferretera "Avante" 🔩🇪🇨
### Arquitectura Empresarial Backend (NestJS + TypeORM + PostgreSQL) & Frontend (React + Vite + Tailwind)

Sistema ERP & POS a medida para la empresa ferretera **Avante** en **Ecuador**, optimizado para moneda en **Dólares estadounidenses (USD)**, normativa del **SRI (Servicio de Rentas Internas)** con tarifa de **IVA al 15%**, control estricto de existencias con kárdex justificado, gestión de cartera de clientes a crédito y contabilidad integrada (NIIF).

---

## 🇪🇨 Localización Tributaria y Financiera (Ecuador)
- **Moneda Oficial**: Dólares estadounidenses (`USD $`).
- **Impuesto al Valor Agregado**: **IVA 15%** (Tarifa legal vigente SRI).
- **Identificación Fiscal**: Soporte para **RUC (13 dígitos)**, **Cédula de Identidad (10 dígitos)** y Pasaporte.
- **Facturación Electrónica SRI**:
  - Formato de numeración: `001-001-XXXXXX` (Establecimiento - Punto de Emisión - Secuencial).
  - Generación de **Clave de Acceso SRI de 49 dígitos numéricos**.
  - Formato de impresión de comprobantes en ticket térmico de 80mm con especificaciones SRI y logotipo de Avante.
- **Razón Social**: `Ferretería Avante Cía. Ltda.` | `RUC: 1792345678001` | Quito - Ecuador.

---

## 🎨 Diseño Visual & Ergonomía
- **Paleta de Colores**: Mezcla armónica entre **Rojizos Corporativos Avante (`red-700`, `rose-800`)**, **Blancos Luminosos (`bg-white`)** para contenedores y tarjetas, y **Plomitos Industriales (`slate-100`, `slate-200`)** para fondos y descansos visuales.
- **Distribución y Tamaño de Botones**:
  - 🟢 **Verde Esmeralda**: Cobro y Confirmación (*"Cobrar y Emitir Factura"*, *"Abonar Cartera"*, *"Ingresar al Sistema"*, *"Guardar en Catálogo"*).
  - 🔵 **Azul Corporativo**: Acciones principales y documentales (*"Imprimir Ticket SRI"*, *"Nuevo Producto"*, *"Ver Kárdex"*).
  - 🟡 **Ámbar / Dorado**: Ajustes y alertas (*"Ajustar Stock"*, *"Filtrar Escasez"*).
  - 🔴 **Rojo Carmesí**: Acciones de alerta y cancelación (*"Vaciar Carrito"*, *"Cerrar Sesión"*, *"Mermas/Daño"*).
  - ⚪ **Plomito Neutro**: Acciones secundarias (*"Cancelar"*, selectores de cantidad `+` y `-`).

---

## 🛠️ Stack Tecnológico
- **Backend**: NestJS 11, TypeORM, PostgreSQL 16, JWT, Bcrypt, Swagger OpenAPI.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons.

---

## 🚀 Inicio Rápido

### Frontend (Acceso Inmediato):
```powershell
cd frontend
npm run dev
```
Abre en tu navegador: 👉 **`http://localhost:5173`**
Haz clic en **"Admin"**, **"Vendedor"** o **"Contador"** para ingresar de inmediato.

### Backend & Base de Datos:
1. Base de datos con Docker:
   ```powershell
   docker compose up -d
   ```
2. Iniciar Backend:
   ```powershell
   cd backend
   npm run seed
   npm run start:dev
   ```
   API disponible en `http://localhost:3001/api/v1` y Swagger en `http://localhost:3001/api/docs`.

---

## 👥 Credenciales de Acceso
- **Administrador**: `admin@avante.com` / `Admin123*`
- **Vendedor**: `vendedor@avante.com` / `Vendedor123*`
- **Contador**: `contador@avante.com` / `Contador123*`
*(También disponibles con un solo clic en la pantalla de inicio de sesión).*
