# API v1 – Proyectos

Documentación breve de los endpoints usados por el frontend de JMAC Earth.

Base URL por defecto (dev): `http://localhost:3000/api/v1`

## POST /projects

Procesa un archivo KMZ y devuelve el cálculo hidráulico.

**Headers**
- `Content-Type: multipart/form-data`

**Body (FormData)**
- `file` (required): archivo `.kmz`
- `name` (string, required)
- `client` (string, optional)
- `description` (string, optional)
- `createdBy` (string, optional)
- `flowRate_m3h` (number)
- `flexiDiameter` (`"10"` | `"12"`)
- `pumpingPressure_kgcm2` (number)
- `numberOfLines` (integer)
- `calculationInterval_m` (number)

**Response 200**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "Proyecto Norte",
      "client": "Cliente A",
      "status": "calculado",
      "traceDistance_km": 2.5,
      "elevationDifference_m": 15.2,
      "elevationSource": "SRTM",
      "createdAt": "2025-11-19T10:00:00.000Z",
      "updatedAt": "2025-11-19T10:00:00.000Z"
    },
    "calculation": {
      "summary": {
        "totalDistance_km": 2.5,
        "elevationDifference_m": 15.2,
        "totalPumps": 2,
        "totalValves": 1
      },
      "pumps": [{ "index": 120, "distance_m": 450, "lat": -23.1, "lon": -57.2, "elevation_m": 420 }],
      "valves": [{ "index": 240, "distance_m": 910, "lat": -23.2, "lon": -57.3, "elevation_m": 415 }],
      "alarms": [{ "type": "pressure", "index": 17, "distance_m": 80, "value": 180, "message": "PSI fuera de rango" }],
      "warnings": []
    }
  }
}
```

**Response 400**
- Falta archivo (`file`), parámetros inválidos, KMZ corrupto.

**Response 500**
- Errores internos (logs en backend).

## GET /projects

Devuelve los proyectos existentes para la vista de histórico en frontend.

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Proyecto Norte",
      "client": "Cliente A",
      "status": "calculado",
      "traceDistance_km": 2.5,
      "elevationDifference_m": 15.2,
      "elevationSource": "SRTM",
      "createdAt": "2025-11-19T10:00:00.000Z",
      "updatedAt": "2025-11-19T10:00:00.000Z"
    }
  ]
}
```

**Response 500**
- Error inesperado de base de datos/servicio.

## Notas de uso con el frontend
- Las llamadas se realizan desde `frontend/src/services/api.ts` usando `axios`.
- El frontend espera que `calculation.trace.points` incluya `lat`/`lon` o `latitude`/`longitude`.
- Para pruebas locales, configurar `VITE_API_URL=http://localhost:3000/api/v1` en `frontend/.env`.
