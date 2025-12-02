# Frontend & Documentation Plan

### 1. Propósito
Proveer una interfaz web que permita al coordinador subir el KMZ, ingresar parámetros hidráulicos, mostrar el mapa interactivo con bombas/válvulas y consultar proyectos guardados. Complementar la documentación del backend (README, API) con la nueva experiencia y los scripts necesarios para ejecutar el stack completo.

### 2. Arquitectura propuesta
- **Stack:** Vite + React + TypeScript + Tailwind (o CSS Modules si ya se usa otro estilo), Leaflet para el mapa y React Hook Form/React Query para formularios y llamados.  
- **Estructura:** `src/pages` (Single Page de “Nuevo Proyecto”), `src/components` (common/button, inputs, map, uploader, summary), `src/services/api.ts` (axios con interceptor), `src/hooks` (useProject, useUpload) y `src/context/auth` si se expanden roles en sprint 2.
- **Integración:** La app consumirá `/api/v1/projects` (creación y listados) y `/api/v1/auth` cuando haya login; la capa HTTP ya existe en el backend y se documentará en el README para que QA pueda replicar.

### 3. Componentes clave
1. `KMZUploader`: drag & drop + botón de archivos; valida extensión `.kmz`, muestra progreso y errores.
2. `ParametersForm`: se basa en `React Hook Form` con campos `flowRate`, `flexiDiameter`, `pumpPressure`, `numberOfLines`, `interval`. Convierte m³/h → BPM y busca coeficientes (puede cargar tabla JSON). Muestra feedback (caudal por línea, coeficiente interpolado, alertas si BPM sin coef).
3. `TraceMap`: Leaflet map que dibuja la traza (polilínea) y coloca marcadores para bombas/ válvulas usando los datos devueltos `calculation`.
4. `TraceSummary`: panel con resumen (punto inicio/fin, distancia, desnivel, bombas/ válvulas, consumo). Incluye botones de exportación futura (disabled por ahora).  
5. `ProjectList` (posterior): lista de proyectos guardados con badges y botón “ver detalles”.

### 4. Flujo de datos
1. Usuario carga KMZ → `KMZParserService` en backend lo valida y extrae coordenadas.  
2. Frontend envía `FormData` con archivo + parámetros a `/api/v1/projects`.  
3. Backend responde `{ project, calculation }` y el frontend muestra el mapa/resumen.  
4. Guardar token/local state si se implementa auth; por ahora no se requiere login, pero dejar hooks preparados para cuando la API lo exija.

### 5. Testing
- **Unit:** React Testing Library para `KMZUploader`, `ParametersForm` y `TraceSummary` (mockear respuestas del API y del hook `useSubmitProject`).  
- **Integration:** Test del flujo “subir + calcular + mostrar mapa” usando MSW para simular `/projects`.  
- **E2E (Sprint siguiente):** Playwright/Cypress para validar upload + resultados reales.

### 6. Documentación
1. **README frontend:** instrucciones de setup (`npm install`, `npm run dev`, `npm run build`), variables env (API_URL, AUTH_TOKEN), y cómo conectar con Docker (puerto 5173).  
2. **README backend:** agregar sección “Frontend” que explique qué endpoints usa, qué responses esperar y cómo correr ambos servicios en paralelo (puede apuntar al `docker-compose` actual).  
3. **API.md (nuevo o existing):** documentar `/projects` POST/GET, cuerpo esperado y estructura de `calculation`. Incluir ejemplos de request/respuesta y errores comunes (archivo faltante, parámetros invalidos).  
4. **Testing docs:** actualizar `tests/README` o sección del README general con comandos para ejecutar los nuevos tests (front y back).

### 7. Organización del trabajo
1. Crear carpeta `frontend/` con Vite + React/TypeScript.  
2. Implementar los componentes mencionados y la capa de servicios (`api.ts`).  
3. Asegurar estilos básicos (Tailwind config o CSS).  
4. Escribir tests unitarios (React Testing Library) y documentarlos.  
5. Actualizar documentación (README/back/API).  
6. Documentar qué pasos seguir para levantar ambos servicios (backend + frontend) y cómo probar con Postman/Insomnia.

### 8. Dependencias y riesgos
- Leaflet requiere CSS global (importar en `main.tsx`).  
- El backend depende de los datos de cálculo; las pruebas deben mockear la respuesta `ProcessKMZUseCase`.  
- Si el frontend llega a necesitar auth, reutilizar los controllers y repositorios que ya existen (auth routes + JWT).

### 9. Próximos pasos inmediatos
1. Scaffolding del proyecto frontend (Vite).  
2. Implementar `KMZUploader` y `ParametersForm` con validaciones.  
3. Consumir el endpoint `/projects` y mostrar el resultado en `TraceSummary` + `TraceMap`.  
4. Añadir tests y actualizar los `README` correspondientes.
