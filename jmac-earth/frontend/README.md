# Frontend · JMAC Earth

SPA built with Vite + React + TypeScript that lets Coordinators upload KMZ traces, enter hydraulic parameters and visualize the calculated pumps/valves on a Leaflet map.

## Setup

```bash
cd frontend
npm install
```

> **Node.js requirement:** Vite 7 requires Node.js 20.19+ or 22.12+. If you are running this project on an older Node version, the dev/build/test scripts will fail at startup.

## Environment

Copy `.env.example` to `.env` (not committed) and adjust:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

The frontend relies on the backend API being available at `VITE_API_URL`. You can run the backend with `npm run dev` from the `backend/` folder (see `backend/README.md` for details).

## Available Scripts

- `npm run dev` – Launch the Vite dev server with HMR (port 5173 by default).
- `npm run build` – Type-check and bundle for production.
- `npm run test` – Run the Vitest suites (Note: Node.js must satisfy the same minimum version as Vite).
- `npm run lint` – Run ESLint over the source tree.
- `npm run preview` – Preview the production build via `vite preview`.

## Testing

- `KMZUploader` and `ParametersForm` have unit tests under `src/components/project/__tests__`.
- Tests run via Vitest in a `jsdom` environment; they are executed automatically via `npm run test`.

## Development Flow

1. Start the backend: `cd backend && npm run dev` (needs Node 18+ and the PostgreSQL Docker stack described in `backend/README.md`).
2. Start the frontend: `cd frontend && npm run dev`.
3. Upload a `.kmz` file, fill in parameters, and trigger “Calcular posiciones”.
4. The map and summary panel show the calculated trace, pump/valve counts, and alarms returned by `/api/v1/projects`.

