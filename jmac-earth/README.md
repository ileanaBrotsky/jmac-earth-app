# JMAC Earth — Full Stack

Este repositorio contiene **dos subproyectos**:

1. `backend/`: API REST en Node.js + TypeScript con arquitectura limpia y casos de uso para procesar archivos KMZ y calcular bombas/válvulas.
2. `frontend/`: SPA Vite + React que permite subir el KMZ, ingresar parámetros hidráulicos, visualizar la traza calculada y mostrar alarmas/resumen.

## Requisitos

- Node.js **24.10.0** (se recomienda usar `nvm` para cambiar de versión antes de trabajar en el frontend)  
- npm correspondiente (11.6.1 con Node 24.10.0)  
- Docker + Docker Compose (para levantar PostgreSQL en `backend/`)

## 1. Backend

```bash
cd backend
npm install
npm run db:setup   # opcional: levanta Docker y ejecuta migraciones
npm run dev        # lanza el servidor Express (puerto 3000)
```

Revisá `backend/README.md` para más detalles de la arquitectura, variables de entorno y scripts.

## 2. Frontend

```bash
cd frontend
npm install
npm run dev        # levanta Vite (puerto 5173)
```

El frontend espera que la API esté disponible en `VITE_API_URL`. Por defecto es `http://localhost:3000/api/v1`; puede configurarse en `.env` antes de arrancar.

## 3. Ejecutar la experiencia completa

1. Levantá la API (`backend/`): `npm run dev`.  
2. En otra terminal con Node 24.10.0 via `nvm`, arrancá el frontend (`frontend/ && npm run dev`).  
3. Subí un `.kmz`, completá los parámetros y presioná *Calcular posiciones* para ver resumen y mapa.

## 4. Tests

- Backend: `npm run test` (Jest)  
- Frontend: `npm run test` (Vitest + Testing Library) — requiere Node 24.10.0 y usa pool `threads`.

Si tenés preguntas sobre cómo vincular ambos proyectos, consultá los READMEs específicos (`backend/README.md`, `frontend/README.md`).
