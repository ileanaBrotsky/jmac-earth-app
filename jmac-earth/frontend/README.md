# Frontend · JMAC Earth

SPA en React/TypeScript (Vite) que permite subir trazas KMZ, ingresar parámetros hidráulicos y visualizar bombas/válvulas sobre Leaflet. Esta guía cubre instalación, variables de entorno y comandos básicos.

## Requisitos

- Node.js 20.19+ (o 22.12+). Vite/Vitest no arrancan en versiones anteriores.
- npm 10+.

## Instalación

```bash
cd frontend
npm install
cp .env.example .env
```

Edita `.env` para apuntar al backend:

```
VITE_API_URL=http://localhost:3000/api/v1
```

## Scripts disponibles

- `npm run dev` – Servidor de desarrollo con HMR (puerto 5173).
- `npm run build` – Type-check + bundle de producción.
- `npm run preview` – Previsualiza el build.
- `npm run test` – Vitest en jsdom (usa setup en `src/tests/setup.ts`).
- `npm run lint` – ESLint.

## Flujo de trabajo

1. Backend: `cd backend && npm install && npm run dev` (o `npm run docker:up` si usas la BD Docker).
2. Frontend: `cd frontend && npm run dev`.
3. Sube un `.kmz`, completa parámetros y ejecuta “Calcular posiciones”.
4. Revisa mapa/summary y el histórico en “Proyectos guardados”.

## Qué expone la UI

- **KMZUploader**: drag & drop, validación de extensión y tamaño, muestra progreso mientras se envía.
- **ParametersForm**: validaciones con Zod/React Hook Form.
- **Feedback de parámetros**: conversión m³/h → BPM, BPM por línea y coeficiente K interpolado.
- **TraceSummary/TraceMap**: resumen y mapa Leaflet con bombas/válvulas.
- **ProjectList**: consume `GET /projects` para listar proyectos guardados.

## Testing

- Unit: componentes en `src/components/project/__tests__` (RTL + Vitest).
- Ejecuta `npm run test`. Si hay problemas de `crypto`, el polyfill está en `src/tests/setup.ts`.

## Integración con backend

- API documentada en `backend/API.md` (POST/GET `/api/v1/projects`).
- El cliente HTTP está en `src/services/api.ts` con detección automática de `multipart/form-data` para `FormData`.

## Notas de estilo

Tailwind no es obligatorio; el proyecto usa CSS global ligero (`src/index.css`). Puedes migrar a Tailwind si el equipo lo requiere.
