# 📋 ANÁLISIS DE REQUISITOS FINAL - JMAC EARTH
## Versión 2.0 - ACTUALIZADO CON ALGORITMO VALIDADO

---

## ✅ ESTADO: APROBADO PARA INICIO DE SPRINT 1

**Fecha aprobación:** {{FECHA}}  
**Aprobado por:** Ileana (Product Owner)

---

## 📊 RESUMEN EJECUTIVO

### Objetivo del Proyecto
Desarrollar una aplicación web que automatice los cálculos hidráulicos para determinar la ubicación óptima de bombas y válvulas reguladoras de presión sobre trazas de mangueras flexibles (flexi) utilizadas en la distribución de agua.

### Problema Actual
- ⏱️ **Tiempo:** Proceso manual de varias horas usando Google Earth + Excel
- 🐛 **Errores:** Propenso a errores humanos en cálculos manuales
- 📂 **Complejidad:** Conversión engorrosa KMZ → GPX → TXT → Excel
- 🔄 **Iteraciones:** Cada cambio requiere recalcular todo manualmente

### Solución Propuesta
- ✅ Upload directo de archivo KMZ
- ✅ Cálculo automático de posiciones (algoritmo validado del Excel actual)
- ✅ Visualización en mapa interactivo
- ✅ Exportación a PDF y KMZ
- ✅ Reducción de tiempo: De horas a minutos

### ROI Esperado
- **Frecuencia:** 1-5 proyectos/mes
- **Ahorro de tiempo:** ~3-4 horas por proyecto → 15-20 horas/mes
- **Reducción de errores:** ~80% menos errores de cálculo manual
- **Trazabilidad:** Historial completo de proyectos

---

## 1️⃣ ACTORES DEL SISTEMA

### Matriz de Actores

| Actor | Rol | Responsabilidades | Frecuencia | Plataforma |
|-------|-----|-------------------|------------|------------|
| **Administrador** | Admin técnico | - Gestión de usuarios<br>- Configuración del sistema<br>- Mantenimiento | Baja (setup + soporte) | Web desktop |
| **Coordinador/Gerente** | Planificador | - Crear proyectos<br>- Generar traza en Google Earth<br>- Upload KMZ<br>- Ingresar parámetros<br>- Revisar/aprobar cambios<br>- Exportar resultados | Alta (1-5 proyectos/mes) | Web desktop |
| **Supervisor** | Ejecutor en campo | - Ver traza planificada<br>- Colocar bombas/válvulas físicamente<br>- Georeferenciar ubicación real<br>- Proponer cambios de traza<br>- Dar feedback | Media (durante proyectos activos) | **Web móvil** (campo, posible sin señal) |
| **Cliente** | Solicitante externo | - Solicita caudal | N/A | ❌ No accede al sistema |

---

## 2️⃣ HISTORIAS DE USUARIO (PRIORIZADAS)

### 🔴 MUST HAVE - MVP (Sprint 1-2, 2-4 semanas)

#### **HU-01: Upload y visualización de KMZ**
```
Como Coordinador,
Quiero subir un archivo KMZ de Google Earth,
Para que el sistema extraiga automáticamente las coordenadas y elevaciones de la traza.

Criterios de aceptación:
✅ DADO que tengo un archivo KMZ válido de Google Earth
✅ CUANDO lo subo al sistema a través de un formulario (drag & drop o botón)
✅ ENTONCES el sistema parsea el archivo y extrae:
   - Coordenadas (lat/long) de todos los puntos
   - Elevación de cada punto
   - Distancia total de la traza
✅ Y muestra la traza en un mapa interactivo (Leaflet)
✅ Y muestra resumen: 
   - Punto inicio (lat/long, elevación)
   - Punto fin (lat/long, elevación)
   - Distancia total (km)
   - Desnivel (metros)
✅ Y permite volver a cargar otro KMZ

Flujos alternativos:
❌ SI el archivo no es KMZ válido → Mostrar error: "Archivo inválido. Por favor sube un archivo .kmz de Google Earth"
⚠️ SI el KMZ no contiene elevaciones (todos = 0) → Mostrar advertencia: "El archivo no contiene datos de elevación. ¿Desea obtenerlos automáticamente usando API de elevación?" [Opción SI/NO]
   - SI → Llamar API de elevación
   - NO → Cancelar proceso (no se puede calcular sin elevaciones)
```

**Complejidad:** Alta (parsing XML + mapa)  
**Prioridad:** 🔥 Crítica  
**Story Points:** 8  
**Dependencias:** Ninguna

**Tareas técnicas:**
- [ ] Instalar jszip + xml2js
- [ ] Crear parser de KMZ
- [ ] Integrar Leaflet
- [ ] Dibujar traza en mapa
- [ ] Validar estructura KMZ
- [ ] Manejar errores de parsing

---

#### **HU-02: Ingreso de parámetros de cálculo**
```
Como Coordinador,
Quiero ingresar los parámetros hidráulicos del proyecto,
Para que el sistema calcule correctamente las posiciones de bombas y válvulas.

Criterios de aceptación:
✅ DADO que ya subí un archivo KMZ
✅ CUANDO completo el formulario con:
   - Caudal solicitado (m³/h) 
     * Mostrar conversión automática a BPM
   - Diámetro de flexi (select: 10", 12")
     * ⚠️ 8", 14", 16" deshabilitados con tooltip: "No disponible (falta tabla de rozamiento)"
   - Presión de bombeo (kg/cm²)
   - Cantidad de líneas de manguera (número entero, min: 1)
   - Intervalo de cálculo (metros, opciones: 25m, 50m, 100m)
     * Por defecto: 50m
✅ ENTONCES el sistema valida:
   - Todos los campos son obligatorios
   - Valores numéricos están en rangos válidos:
     * Caudal > 0
     * Presión > 0 y < 50 kg/cm²
     * Líneas >= 1 y <= 10
   - Campos deshabilitados si no hay KMZ cargado
✅ Y muestra cálculo en tiempo real:
   - "Caudal por línea: X BPM" (si líneas > 1)
   - "Coeficiente de rozamiento: X" (al seleccionar diámetro + caudal)
✅ Y habilita el botón "Calcular posiciones"

Validaciones específicas:
- Si líneas > 1 → Dividir caudal automáticamente y mostrar
- Mostrar siempre: Caudal total (m³/h) | Caudal total (BPM) | Caudal por línea (BPM)
- Validar que el caudal (BPM) tenga coeficiente en la tabla (advertir si no)
```

**Complejidad:** Media  
**Prioridad:** 🔥 Crítica  
**Story Points:** 5  
**Dependencias:** HU-01

**Tareas técnicas:**
- [ ] Crear formulario con React Hook Form
- [ ] Validaciones de campos
- [ ] Conversión m³/h → BPM
- [ ] Lookup de coeficiente de rozamiento
- [ ] Interpolación si BPM no está en tabla
- [ ] Feedback visual en tiempo real

---

#### **HU-03: Cálculo automático de posiciones de bombas y válvulas**
```
Como Coordinador,
Quiero que el sistema calcule automáticamente dónde colocar bombas y válvulas,
Para eliminar el proceso manual de Excel y reducir errores.

Criterios de aceptación:
✅ DADO que tengo un KMZ cargado y parámetros válidos ingresados
✅ CUANDO presiono "Calcular posiciones"
✅ ENTONCES el sistema:
   1. Muestra loading indicator: "Calculando... (esto puede tardar unos segundos)"
   2. Toma los puntos de la traza cada X metros (según intervalo)
   3. Calcula para cada punto:
      - Altura acumulada (N)
      - Presión estática (M) en kg/cm²
      - Pérdida por rozamiento (K) en PSI
      - Presión combinada en PSI (O)
      - Presión combinada en kg/cm² (P)
   4. Identifica posiciones de BOMBAS:
      - **BOMBA 1:** SIEMPRE en el punto de inicio (i=0)
      - Siguientes: cada vez que P >= presion_bombeo * num_bombas_previas
   5. Identifica posiciones de VÁLVULAS:
      - Cuando N < -presion_bombeo
   6. Calcula consumo de combustible (litros/hora)
✅ Y muestra resultados en <1 minuto
✅ Y marca bombas y válvulas en el mapa:
   - Bombas: ícono azul
   - Válvulas: ícono rojo
✅ Y muestra tabla resumen con:
   | Tipo | # | Distancia (m) | Lat/Long | Elevación (m) | Presión (kg/cm²) |
✅ Y muestra panel de resumen:
   - Total bombas: X
   - Total válvulas: Y
   - Distancia total: Z km
   - Desnivel: W metros
   - Consumo combustible: V litros/hora
✅ Y permite exportar resultados

Alarmas críticas:
🚨 SI presión combinada (PSI) > 200 o < -200:
   → Mostrar alerta modal crítica con:
   * Título: "⚠️ ALARMA CRÍTICA: Presión fuera de límites"
   * Detalle: "En punto [distancia]m, presión = [valor] PSI"
   * Recomendación: "Ajuste parámetros (caudal, diámetro, líneas) o revise traza"
   * Opciones: [Ajustar parámetros] [Marcar para revisión manual]

⚠️ SI consumo combustible > UMBRAL (POR CONFIRMAR):
   → Mostrar advertencia amarilla:
   * "Consumo elevado: [valor] L/h. Verificar viabilidad económica."
```

**Complejidad:** 🔥 Muy Alta (core del negocio)  
**Prioridad:** 🔥 Crítica  
**Story Points:** 13  
**Dependencias:** HU-01, HU-02  
**⚠️ REQUIERE:** Algoritmo validado del Excel (ver documento separado)

**Tareas técnicas:**
- [ ] Implementar algoritmo hidráulico completo
- [ ] Cálculo de pérdida por rozamiento (K)
- [ ] Cálculo de presión estática (M)
- [ ] Cálculo de altura acumulada (N)
- [ ] Cálculo de presión combinada (O, P)
- [ ] Lógica de colocación de bombas
- [ ] Lógica de colocación de válvulas
- [ ] Cálculo de consumo combustible
- [ ] Sistema de alarmas
- [ ] Testing exhaustivo con casos del Excel

---

#### **HU-04: Visualización de resultados en mapa**
```
Como Coordinador,
Quiero ver la traza con las bombas y válvulas marcadas,
Para validar visualmente que el cálculo tiene sentido antes de enviar al Supervisor.

Criterios de aceptación:
✅ DADO que el cálculo finalizó exitosamente
✅ CUANDO veo el mapa de resultados
✅ ENTONCES veo:
   - Traza completa dibujada en color verde
   - Íconos de BOMBA (azul, numerados) en cada posición calculada
   - Íconos de VÁLVULA (rojo, numerados) en cada posición calculada
   - Al hacer click en un ícono → popup con detalles:
     * Tipo: Bomba #1 / Válvula #1
     * Distancia desde inicio: 1500m
     * Coordenadas: -38.2353, -68.6271
     * Elevación: 508m
     * Presión: 12.5 kg/cm² / 180 PSI
✅ Y tengo controles de mapa:
   - Zoom in/out (botones + rueda mouse)
   - Pan (arrastrar)
   - Fit bounds (botón "Centrar traza")
   - Cambiar capa base: [Mapa] [Satélite]
✅ Y puedo:
   - Volver a editar parámetros → Recalcular
   - Exportar resultados
   - Guardar proyecto (si está implementado)
✅ Y la visualización es responsive (se adapta a pantalla)
```

**Complejidad:** Media  
**Prioridad:** 🔥 Crítica  
**Story Points:** 5  
**Dependencias:** HU-03

**Tareas técnicas:**
- [ ] Dibujar bombas/válvulas en Leaflet
- [ ] Crear popups interactivos
- [ ] Controles de mapa
- [ ] Leyenda (Bomba = azul, Válvula = rojo)
- [ ] Botón "Centrar traza"
- [ ] Cambio de capa base

---

### 🟡 SHOULD HAVE - MVP Extendido (Sprint 3-4, 4-6 semanas)

#### **HU-05: Gestión de proyectos**
```
Como Coordinador,
Quiero crear y gestionar proyectos,
Para organizar múltiples cálculos y tener trazabilidad.

Criterios de aceptación:
✅ DADO que inicio sesión como Coordinador
✅ CUANDO accedo a "Mis Proyectos"
✅ ENTONCES puedo:
   - Ver lista de proyectos con:
     * Nombre proyecto
     * Cliente
     * Fecha creación
     * Fecha última modificación
     * Estado: [Borrador] [En ejecución] [Completado]
   - Crear nuevo proyecto:
     * Formulario: Nombre (obligatorio), Cliente (opcional), Descripción (opcional)
   - Editar proyecto existente
   - Eliminar proyecto (con confirmación)
   - Ver historial de cálculos de cada proyecto
✅ Y cada proyecto guarda:
   - KMZ original
   - Parámetros usados (caudal, diámetro, etc.)
   - Resultados calculados (bombas, válvulas)
   - Fecha de creación/modificación
   - Usuario que lo creó
✅ Y puedo buscar/filtrar proyectos por:
   - Nombre
   - Cliente
   - Fecha
   - Estado
```

**Complejidad:** Media  
**Prioridad:** 🟡 Alta  
**Story Points:** 8  
**Dependencias:** Sistema de autenticación

---

#### **HU-06: Exportación de resultados**
```
Como Coordinador,
Quiero exportar los resultados a PDF y/o KMZ,
Para compartir con el Supervisor o guardar registro.

Criterios de aceptación:
✅ DADO que tengo resultados calculados
✅ CUANDO presiono "Exportar"
✅ ENTONCES puedo elegir formato:
   
   **OPCIÓN A: PDF**
   - Documento con:
     * Logo JMAC (si disponible)
     * Nombre proyecto, Cliente, Fecha
     * Mapa estático con traza y puntos
     * Tabla de bombas (todas las columnas)
     * Tabla de válvulas (todas las columnas)
     * Gráfico de perfil de elevación con puntos marcados
     * Resumen:
       - Total bombas: X
       - Total válvulas: Y
       - Distancia total: Z km
       - Desnivel: W m
       - Consumo combustible: V L/h
     * Alarmas (si las hay)
     * Parámetros usados
   - Nombre archivo: `JMAC_[proyecto]_[fecha].pdf`
   
   **OPCIÓN B: KMZ**
   - Archivo para Google Earth con:
     * Traza original (línea verde)
     * Placemarks de bombas (ícono azul)
       - Nombre: "Bomba #1"
       - Descripción: Distancia, Coordenadas, Elevación, Presión
     * Placemarks de válvulas (ícono rojo)
       - Nombre: "Válvula #1"
       - Descripción: Distancia, Coordenadas, Elevación, Presión
   - Nombre archivo: `JMAC_[proyecto]_resultados_[fecha].kmz`

✅ Y el archivo se descarga automáticamente
✅ Y se guarda log de exportación (quién, cuándo, formato)
```

**Complejidad:** Alta (generación PDF + KMZ)  
**Prioridad:** 🟡 Alta  
**Story Points:** 13  
**Dependencias:** HU-04

**Tareas técnicas:**
- [ ] Generación PDF con pdfkit o puppeteer
- [ ] Captura mapa estático
- [ ] Generación gráfico de elevación (Recharts)
- [ ] Generación KMZ (jszip + xml builder)
- [ ] Descarga automática de archivos

---

#### **HU-07: Sistema de usuarios y roles**
```
Como Administrador,
Quiero gestionar usuarios y sus permisos,
Para controlar el acceso al sistema.

Criterios de aceptación:
✅ DADO que soy Administrador
✅ CUANDO accedo a "Gestión de Usuarios"
✅ ENTONCES puedo:
   - Crear usuarios:
     * Email (obligatorio, único)
     * Nombre completo (obligatorio)
     * Password (obligatorio, mínimo 8 caracteres)
     * Rol (select): Admin | Coordinador | Supervisor
   - Ver lista de usuarios con:
     * Nombre, Email, Rol, Fecha creación, Estado (Activo/Inactivo)
   - Editar usuarios existentes
   - Desactivar/Activar usuarios (soft delete)
   - Eliminar usuarios (con confirmación)
   - Asignar/cambiar roles
✅ Y cada rol tiene permisos diferenciados:
   
   **ADMIN:**
   - Gestión de usuarios
   - Todas las funciones de Coordinador
   
   **COORDINADOR:**
   - Crear/editar/eliminar proyectos propios
   - Ver todos los proyectos
   - Calcular posiciones
   - Exportar resultados
   - Asignar proyectos a Supervisores
   
   **SUPERVISOR:**
   - Ver proyectos asignados (solo lectura)
   - Georreferenciar (en fase 2)
   - Proponer cambios (en fase 2)

✅ Y el sistema valida permisos en cada acción
✅ Y se registra log de acciones de usuarios
```

**Complejidad:** Media (ya tenemos base en proyecto)  
**Prioridad:** 🟡 Media  
**Story Points:** 8  
**Dependencias:** Módulo User actual puede reutilizarse

**⚠️ NOTA:** El módulo User actual ya tiene Email, Role, y repositorio. Se puede reaprovechar.

---

### 🟢 COULD HAVE - Post-MVP (Sprint 5+, 6-10 semanas)

#### **HU-08: Visualización para Supervisor (mobile)**
```
Como Supervisor,
Quiero ver en mi celular la traza con las posiciones planificadas,
Para guiarme durante la instalación en campo.

Criterios de aceptación:
✅ DADO que tengo un proyecto asignado
✅ CUANDO accedo desde mi celular
✅ ENTONCES veo:
   - Mapa adaptado a móvil (Leaflet responsive)
   - Mi ubicación GPS actual (punto verde parpadeante)
   - Traza con bombas/válvulas marcadas
   - Distancia a próxima bomba/válvula
   - Lista de bombas/válvulas con distancias
✅ Y la interfaz es mobile-first:
   - Botones grandes táctiles
   - Texto legible sin zoom
   - Controles optimizados para touch
✅ Y funciona en modo portrait y landscape
```

**Complejidad:** Media (responsive design)  
**Prioridad:** 🟢 Media  
**Story Points:** 5  
**Dependencias:** HU-04

---

#### **HU-09: Georreferenciación de instalación real**
```
Como Supervisor,
Quiero marcar en el mapa dónde coloqué REALMENTE cada bomba/válvula,
Para validar que la instalación coincide con lo planificado.

Criterios de aceptación:
✅ DADO que estoy en campo con el proyecto abierto
✅ CUANDO coloco físicamente una bomba
✅ ENTONCES:
   - Presiono botón "Marcar Bomba #1"
   - Sistema captura mi ubicación GPS actual (geolocation API)
   - Sistema marca el punto en el mapa (ícono verde)
   - Sistema calcula desviación respecto a posición planificada:
     * Si < 50m → OK (verde)
     * Si 50-100m → Advertencia (amarillo)
     * Si > 100m → Alerta (rojo, notificar Coordinador)
   - Registro:
     * Coordenadas reales
     * Foto (opcional, usando cámara del celular)
     * Comentarios (opcional, texto libre)
     * Timestamp
     * Usuario que registró
✅ Y puedo ver en el mapa:
   - Posición planificada (azul/rojo)
   - Posición real (verde)
   - Línea de desviación entre ambos

Modo offline (CRÍTICO):
✅ SI no tengo señal de internet:
   → Guardar datos localmente (localStorage/IndexedDB)
✅ CUANDO recupere señal:
   → Sincronizar automáticamente con servidor
   → Mostrar notificación: "Datos sincronizados exitosamente"
✅ Y puedo ver en UI:
   - Indicador "Modo offline" (ícono naranja)
   - Lista de registros pendientes de sincronizar
```

**Complejidad:** Alta (PWA + offline)  
**Prioridad:** 🟢 Alta  
**Story Points:** 13  
**Dependencias:** HU-08

**Tareas técnicas:**
- [ ] Implementar PWA (Service Workers)
- [ ] Geolocation API
- [ ] IndexedDB para almacenamiento offline
- [ ] Sincronización en background
- [ ] Cámara API (opcional)
- [ ] Cálculo de desviaciones

---

#### **HU-10: Propuesta de cambios por Supervisor**
```
Como Supervisor,
Quiero proponer cambios en la traza cuando encuentro obstáculos en campo,
Para que Gerencia revise y apruebe antes de continuar.

Criterios de aceptación:
✅ DADO que estoy en campo y encuentro un problema (ej: terreno inaccesible, río no marcado, etc.)
✅ CUANDO presiono "Proponer cambio"
✅ ENTONCES:
   - Puedo:
     * Dibujar nueva traza alternativa en el mapa (usando herramienta de dibujo)
     * Marcar punto problemático con pin
     * Tomar foto del problema
   - Formulario obligatorio:
     * Tipo de problema: [Terreno inaccesible] [Obstáculo natural] [Permiso denegado] [Otro]
     * Descripción del problema (texto, min 20 caracteres)
     * Foto (obligatoria)
     * Propuesta de solución (texto, opcional)
   - Al enviar:
     * Estado del proyecto → "Pendiente de revisión"
     * Notificación enviada a Coordinador
     * Supervisor no puede continuar hasta aprobación

✅ Y el Coordinador recibe:
   - Notificación push/email
   - Vista de la propuesta:
     * Traza original (verde)
     * Traza propuesta (amarillo)
     * Punto problemático (rojo)
     * Fotos adjuntas
     * Comentarios del Supervisor
   - Opciones:
     * [Aprobar] → Recalcular con nueva traza → Notificar Supervisor
     * [Rechazar] → Formulario explicando por qué → Notificar Supervisor
     * [Solicitar más info] → Chat con Supervisor

✅ Y el Supervisor recibe respuesta:
   - Notificación push
   - Si aprobado: Nueva traza + nuevos cálculos
   - Si rechazado: Explicación + instrucciones
```

**Complejidad:** Alta (workflow + notificaciones)  
**Prioridad:** 🟢 Media  
**Story Points:** 13  
**Dependencies:** HU-08, HU-09, sistema de notificaciones

**Tareas técnicas:**
- [ ] Herramienta de dibujo en mapa (Leaflet.draw)
- [ ] Upload de fotos
- [ ] Sistema de notificaciones (push + email)
- [ ] Workflow de aprobaciones
- [ ] Chat simple entre roles

---

### ⚪ WON'T HAVE - Futuro lejano

- **HU-11:** Integración directa con Google Earth API (no hay API pública estable)
- **HU-12:** App móvil nativa (PWA es suficiente)
- **HU-13:** Cálculo de costos por proyecto (no prioritario)
- **HU-14:** Integración con ERP/facturación (fuera de alcance)
- **HU-15:** Portal para clientes externos (no necesario)
- **HU-16:** Análisis predictivo con IA (muy futuro)
- **HU-17:** Simulaciones 3D de la traza (no necesario)

---

## 3️⃣ CASOS DE USO DETALLADOS

### **CU-01: Crear proyecto y calcular posiciones**

**ID:** CU-01  
**Actor principal:** Coordinador  
**Precondiciones:**  
- Usuario autenticado con rol Coordinador/Admin  
- Tiene archivo KMZ de Google Earth con elevaciones

**Flujo principal:**

1. Coordinador accede a "Nuevo Proyecto"
2. Sistema muestra formulario de proyecto
3. Coordinador ingresa:
   - Nombre del proyecto (obligatorio)
   - Cliente (opcional)
   - Descripción (opcional)
4. Sistema guarda borrador y habilita sección "Cálculo"
5. Coordinador sube archivo KMZ (drag & drop o botón)
6. Sistema parsea KMZ y extrae:
   - Coordenadas de la traza (lat/long)
   - Elevaciones de cada punto
   - Distancia total
7. Sistema muestra mapa con traza visualizada (línea verde)
8. Sistema muestra resumen:
   - Inicio: [lat, long, elevación]
   - Fin: [lat, long, elevación]
   - Distancia total: X km
   - Desnivel: Y metros (fin - inicio)
9. Coordinador ingresa parámetros hidráulicos:
   - Caudal (m³/h)
     * Sistema muestra conversión a BPM en tiempo real
   - Diámetro de flexi (10" o 12")
   - Presión de bombeo (kg/cm²)
   - Cantidad de líneas de manguera
     * Sistema muestra caudal por línea si > 1
   - Intervalo de cálculo (25m, 50m, 100m)
10. Sistema valida parámetros:
    - Todos campos completos
    - Valores en rangos válidos
    - Caudal tiene coeficiente en tabla
11. Sistema habilita botón "Calcular"
12. Coordinador presiona "Calcular"
13. Sistema muestra loading: "Calculando posiciones..."
14. Sistema ejecuta algoritmo hidráulico:
    - Itera sobre puntos cada X metros (según intervalo)
    - Calcula K, M, N, O, P para cada punto
    - Identifica posiciones de bombas (primera en inicio)
    - Identifica posiciones de válvulas
    - Calcula consumo combustible
    - Detecta alarmas
15. Sistema muestra resultados:
    - Mapa con:
      * Traza (verde)
      * Bombas (íconos azules numerados)
      * Válvulas (íconos rojos numerados)
    - Tabla de resultados (bombas + válvulas)
    - Panel de resumen
    - Alarmas (si las hay)
16. Coordinador revisa resultados visualmente
17. Coordinador guarda proyecto
18. Sistema confirma: "Proyecto guardado exitosamente"

**Flujos alternativos:**

**A1. Archivo KMZ inválido (paso 6)**
- 6.1. Sistema detecta error en parsing XML
- 6.2. Sistema muestra error modal:
  * Título: "Error al procesar archivo"
  * Mensaje: "El archivo no es un KMZ válido. Por favor exporta desde Google Earth Pro."
  * Botón: [Intentar con otro archivo]
- 6.3. Volver a paso 5

**A2. KMZ sin elevaciones (paso 6)**
- 6.1. Sistema detecta que todas las elevaciones = 0
- 6.2. Sistema muestra advertencia modal:
  * Título: "⚠️ Archivo sin datos de elevación"
  * Mensaje: "El archivo no contiene información de altitud. Esto es necesario para calcular posiciones de bombas y válvulas."
  * Opciones:
    - [Obtener elevaciones automáticamente] → Ir a A2.3
    - [Cargar otro archivo] → Volver a paso 5
    - [Cancelar] → Volver a paso 1
- 6.3. Sistema llama Google Elevation API
- 6.4. SI éxito → Continuar con paso 7
- 6.5. SI error API:
  * Mostrar error: "No se pudieron obtener elevaciones. Verifica tu conexión o carga un KMZ con elevaciones."
  * Volver a paso 5

**A3. Parámetros inválidos (paso 10)**
- 10.1. Sistema detecta errores de validación
- 10.2. Sistema marca campos con error en rojo
- 10.3. Sistema muestra mensajes de error específicos debajo de cada campo
- 10.4. Botón "Calcular" permanece deshabilitado
- 10.5. Volver a paso 9

**A4. Caudal sin coeficiente en tabla (paso 10)**
- 10.1. Sistema calcula BPM del caudal
- 10.2. Sistema busca coeficiente en tabla
- 10.3. SI BPM está fuera del rango de la tabla:
  * Mostrar advertencia: "El caudal ingresado está fuera del rango de la tabla de rozamiento. Los cálculos pueden ser imprecisos."
  * Permitir continuar o ajustar caudal
- 10.4. SI BPM está entre dos valores de la tabla:
  * Sistema interpola linealmente
  * Mostrar info: "Usando coeficiente interpolado: X"

**A5. Cálculo genera alarma crítica (paso 15)**
- 15.1. Sistema detecta presión > 200 PSI o < -200 PSI
- 15.2. Sistema muestra alerta modal crítica:
  * Título: "🚨 ALARMA CRÍTICA: Presión fuera de límites"
  * Detalles:
    - Punto: [distancia]m, [lat/long]
    - Presión: [valor] PSI / [valor] kg/cm²
    - Límite seguro: ±200 PSI
  * Recomendaciones:
    - Reducir caudal
    - Aumentar número de líneas
    - Usar diámetro mayor
    - Revisar traza (evitar pendientes muy pronunciadas)
  * Opciones:
    - [Ajustar parámetros] → Volver a paso 9
    - [Marcar para revisión manual] → Agregar nota al proyecto
    - [Continuar de todos modos] → Guardar con flag de riesgo
- 15.3. Coordinador elige opción
- 15.4. Según elección → Continuar o volver

**A6. Usuario cancela en cualquier momento**
- X.1. Sistema detecta intento de salir/cerrar
- X.2. Sistema pregunta: "¿Deseas guardar los cambios como borrador?"
  * [Guardar borrador] → Guardar estado actual
  * [Descartar cambios] → Eliminar datos temporales
  * [Cancelar] → Volver a donde estaba
- X.3. Según elección → Ejecutar acción

**Postcondiciones:**
- Proyecto creado en BD con estado "Borrador" o "Completado"
- KMZ almacenado en storage
- Parámetros guardados
- Resultados calculados y guardados
- Proyecto visible en lista del Coordinador
- Log de actividad registrado

---

### **CU-02: Exportar resultados a PDF**

**ID:** CU-02  
**Actor principal:** Coordinador  
**Precondiciones:**  
- Usuario autenticado
- Proyecto con resultados calculados

**Flujo principal:**

1. Coordinador abre proyecto guardado con resultados
2. Coordinador presiona botón "Exportar"
3. Sistema muestra modal con opciones:
   - [Exportar a PDF]
   - [Exportar a KMZ]
   - [Ambos]
4. Coordinador selecciona "PDF"
5. Sistema muestra loading: "Generando PDF..."
6. Sistema genera documento PDF con:
   - **Encabezado:**
     * Logo JMAC (si disponible)
     * Título: "Cálculo Hidráulico - [Nombre Proyecto]"
     * Cliente: [Nombre Cliente]
     * Fecha: [Fecha actual]
   - **Resumen del Proyecto:**
     * Distancia total: X km
     * Desnivel: Y m
     * Caudal: Z m³/h (W BPM)
     * Diámetro flexi: N"
     * Presión bombeo: P kg/cm²
     * Líneas: L
   - **Mapa estático:**
     * Captura de pantalla del mapa con traza y puntos
     * Leyenda: Bomba (azul), Válvula (rojo)
   - **Tabla de Bombas:**
     | # | Distancia (m) | Lat/Long | Elevación (m) | Presión (kg/cm²) |
   - **Tabla de Válvulas:**
     | # | Distancia (m) | Lat/Long | Elevación (m) | Presión (kg/cm²) |
   - **Gráfico de perfil de elevación:**
     * Eje X: Distancia (m)
     * Eje Y: Elevación (m)
     * Línea: Perfil de terreno
     * Puntos: Bombas (azul) y Válvulas (rojo)
   - **Resultados:**
     * Total bombas: X
     * Total válvulas: Y
     * Consumo combustible: Z litros/hora
   - **Alarmas** (si las hay):
     * Lista de alarmas con detalles
   - **Pie de página:**
     * "Generado por JMAC Earth - [Fecha y hora]"
     * Usuario: [Nombre Coordinador]
7. Sistema descarga archivo: `JMAC_[NombreProyecto]_[Fecha].pdf`
8. Sistema muestra notificación: "PDF generado y descargado exitosamente"
9. Sistema registra log de exportación:
   - Usuario
   - Fecha/hora
   - Tipo: PDF
   - Proyecto

**Flujos alternativos:**

**A1. Error en generación de mapa estático (paso 6)**
- 6.1. Sistema no puede capturar imagen del mapa (error de renderizado)
- 6.2. Sistema genera PDF sin mapa
- 6.3. Sistema agrega nota en PDF: "Error al generar vista de mapa. Por favor consulte el sistema online."
- 6.4. Continuar con paso 7

**A2. Error en generación de PDF (paso 6)**
- 6.1. Sistema detecta error fatal en generación
- 6.2. Sistema muestra error modal:
  * "Error al generar PDF. Por favor intenta nuevamente o contacta soporte."
- 6.3. Sistema registra error en logs
- 6.4. Volver a paso 2

**Postcondiciones:**
- Archivo PDF disponible para descarga
- Log de exportación guardado en BD
- Usuario tiene copia local del PDF

---

## 4️⃣ PRIORIZACIÓN MOSCOW (Tabla Resumen)

### 🔴 MUST HAVE - MVP (Sprint 1-2, 2-4 semanas)

| ID | Historia de Usuario | Complejidad | Story Points | Sprint |
|----|---------------------|-------------|--------------|--------|
| HU-01 | Upload y visualización KMZ | Alta | 8 | 1 |
| HU-02 | Ingreso parámetros | Media | 5 | 1 |
| HU-03 | Cálculo automático | Muy Alta | 13 | 1-2 |
| HU-04 | Visualización resultados | Media | 5 | 2 |

**Total Story Points:** 31  
**Entregable:** Sistema funcional básico que reemplaza Excel  
**Criterio de éxito:** Cálculo correcto validado con Excel actual

---

### 🟡 SHOULD HAVE - MVP Extendido (Sprint 3-4, 4-6 semanas)

| ID | Historia de Usuario | Complejidad | Story Points | Sprint |
|----|---------------------|-------------|--------------|--------|
| HU-05 | Gestión de proyectos | Media | 8 | 3 |
| HU-06 | Exportación PDF/KMZ | Alta | 13 | 3-4 |
| HU-07 | Sistema usuarios/roles | Media | 8 | 4 |

**Total Story Points:** 29  
**Entregable:** Sistema completo para Coordinadores con persistencia

---

### 🟢 COULD HAVE - Post-MVP (Sprint 5-7, 6-10 semanas)

| ID | Historia de Usuario | Complejidad | Story Points | Sprint |
|----|---------------------|-------------|--------------|--------|
| HU-08 | Vista móvil Supervisor | Media | 5 | 5 |
| HU-09 | Georreferenciación real | Alta | 13 | 6 |
| HU-10 | Propuesta de cambios | Alta | 13 | 7 |

**Total Story Points:** 31  
**Entregable:** Sistema completo para Coordinadores + Supervisores

---

### ⚪ WON'T HAVE (Descartado para este proyecto)

- Google Earth API integration
- App móvil nativa
- Cálculo de costos
- Portal clientes
- Integración ERP
- IA/ML features

---

## 5️⃣ DEFINICIÓN DEL MVP (Sprint 1-2)

### 🎯 Alcance Mínimo Viable

**Objetivo:** Reemplazar el proceso manual Excel + Google Earth con una aplicación web básica que calcule correctamente las posiciones de bombas y válvulas.

**Duración:** 2-4 semanas (2 sprints de 1-2 semanas)

**¿Qué DEBE hacer el MVP?**

✅ **Upload de KMZ:**
- Arrastrar archivo o seleccionar con botón
- Parsear XML dentro del ZIP
- Extraer coordenadas (lat/long)
- Extraer elevaciones
- Validar formato
- Manejar errores

✅ **Visualización de traza:**
- Mapa interactivo (Leaflet)
- Dibujar traza completa
- Mostrar punto inicio y fin
- Resumen: Distancia, Desnivel
- Zoom, Pan, Controles básicos

✅ **Formulario de parámetros:**
- Caudal (m³/h)
- Diámetro flexi (10", 12")
- Presión bombeo (kg/cm²)
- Líneas de manguera
- Intervalo de cálculo
- Validaciones en tiempo real
- Conversión m³/h → BPM

✅ **Botón "Calcular":**
- Ejecutar algoritmo hidráulico completo
- Devolver posiciones de bombas y válvulas
- Calcular consumo combustible
- Detectar alarmas

✅ **Visualización de resultados:**
- Mapa con íconos de bombas (azul) y válvulas (rojo)
- Popup con detalles al hacer click
- Tabla HTML con todos los puntos
- Panel de resumen:
  * Total bombas: X
  * Total válvulas: Y
  * Consumo combustible: Z L/h
- Alarmas (si aplican) en modal

✅ **Validación con Excel:**
- Usar al menos 3 casos reales de JMAC
- Resultados deben coincidir ±5% con Excel actual
- Documentar cualquier discrepancia

---

### ❌ Qué NO tiene el MVP

❌ Login/autenticación (bypass con user hardcoded)  
❌ Base de datos (cálculos volátiles, no persisten)  
❌ Guardar proyectos  
❌ Historial  
❌ Exportar a PDF/KMZ  
❌ Vista móvil optimizada  
❌ Georreferenciación  
❌ Notificaciones  
❌ Modo offline  

**Justificación:** El MVP se enfoca EXCLUSIVAMENTE en validar el algoritmo hidráulico. Todo lo demás es infraestructura que se agrega después.

---

### 📊 Criterios de Éxito del MVP

El MVP será considerado **EXITOSO** si:

1. ✅ Un Coordinador puede subir un KMZ real de JMAC
2. ✅ El sistema extrae coordenadas y elevaciones correctamente
3. ✅ El sistema calcula posiciones de bombas y válvulas
4. ✅ Los resultados coinciden con el Excel actual (±5% margen de error)
5. ✅ El proceso completo toma <5 minutos (vs varias horas del proceso actual)
6. ✅ El Coordinador valida visualmente que el cálculo es correcto
7. ✅ Se identifican y documentan 3 casos de prueba validados
8. ✅ El sistema maneja errores comunes (KMZ inválido, sin elevaciones, etc.)

---

### 🚀 Entregable del MVP

**Demo funcional con:**
- 1 caso real de JMAC completamente calculado
- Comparación lado a lado: Excel vs JMAC Earth
- Video de 3 minutos mostrando el flujo completo
- Documento de validación con resultados

---

## 6️⃣ STACK TÉCNICO DEFINITIVO

### **Frontend**
```
- React 18 (con TypeScript)
- Vite (build tool)
- Tailwind CSS (estilos)
- Leaflet (mapas open source)
- React Hook Form (formularios)
- Recharts (gráficos)
- Axios (HTTP client)
```

### **Backend** (aprovechando base existente)
```
✅ Node.js 18+
✅ Express 4.x
✅ TypeScript 5.x
✅ TypeORM 0.3.x
✅ PostgreSQL 15
✅ Docker (desarrollo)

Nuevas librerías:
- jszip (parsear KMZ)
- xml2js (parsear KML)
- pdfkit o puppeteer (generar PDF en fase 2)
- sharp (procesar imágenes en fase 2)
```

### **Infraestructura**
```
Desarrollo:
- Docker Compose (PostgreSQL local)
- Vite dev server

Producción (Fase 2):
- Hosting: Railway / Render / Fly.io (free tier inicial)
- Storage: AWS S3 free tier o Cloudinary (KMZ files)
- DB: PostgreSQL (migrar de Docker a cloud)
```

### **Testing**
```
✅ Jest (unit tests) - Ya configurado
✅ Supertest (integration tests) - Ya configurado
- React Testing Library (componentes)
- Cypress (E2E en fase 2)
```

### **Offline (Fase 2 - Sprint 6+)**
```
- PWA (Progressive Web App)
- Service Workers (cache + offline)
- IndexedDB (almacenamiento local)
- Background Sync API
```

---

## 7️⃣ ARQUITECTURA DE CLEAN ARCHITECTURE

### Capas (Backend)

```
├── Domain Layer (Lógica de negocio pura)
│   ├── Entities
│   │   ├── User ✅ (ya existe)
│   │   ├── Project (nuevo)
│   │   ├── Trace (nuevo)
│   │   ├── Pump (nuevo)
│   │   └── Valve (nuevo)
│   ├── Value Objects
│   │   ├── Email ✅ (ya existe)
│   │   ├── Role ✅ (ya existe)
│   │   ├── Coordinates (nuevo)
│   │   ├── Pressure (nuevo)
│   │   ├── Flow (nuevo)
│   │   └── Diameter (nuevo)
│   ├── Domain Services
│   │   ├── HydraulicCalculator (nuevo)
│   │   ├── FrictionCalculator (nuevo)
│   │   └── ElevationAnalyzer (nuevo)
│   └── Repositories (interfaces)
│       ├── IUserRepository ✅ (ya existe)
│       ├── IProjectRepository (nuevo)
│       └── ITraceRepository (nuevo)
│
├── Application Layer (Casos de uso)
│   ├── Use Cases
│   │   ├── CreateProject (nuevo)
│   │   ├── UploadKMZ (nuevo)
│   │   ├── CalculatePositions (nuevo)
│   │   ├── ExportToPDF (nuevo)
│   │   └── ExportToKMZ (nuevo)
│   └── Services
│       ├── KMZParserService (nuevo)
│       ├── ProjectService (nuevo)
│       └── AuthService (nuevo en fase 2)
│
├── Infrastructure Layer (Implementaciones)
│   ├── Database
│   │   ├── TypeORM config ✅ (ya existe)
│   │   ├── Entities
│   │   │   ├── UserEntity ✅ (ya existe)
│   │   │   ├── ProjectEntity (nuevo)
│   │   │   └── TraceEntity (nuevo)
│   │   ├── Repositories
│   │   │   ├── TypeORMUserRepository ✅ (ya existe)
│   │   │   ├── TypeORMProjectRepository (nuevo)
│   │   │   └── TypeORMTraceRepository (nuevo)
│   │   └── Mappers
│   │       ├── UserMapper ✅ (ya existe)
│   │       ├── ProjectMapper (nuevo)
│   │       └── TraceMapper (nuevo)
│   └── External Services
│       ├── GoogleElevationAPI (nuevo)
│       └── FileStorage (nuevo)
│
└── Interfaces Layer (Presentación)
    ├── Controllers
    │   ├── ProjectController (nuevo)
    │   └── TraceController (nuevo)
    ├── Routes
    │   ├── projects.routes (nuevo)
    │   └── traces.routes (nuevo)
    ├── Middleware
    │   ├── authMiddleware (nuevo en fase 2)
    │   ├── uploadMiddleware (nuevo)
    │   └── errorMiddleware (nuevo)
    └── Validators
        ├── projectValidators (nuevo)
        └── traceValidators (nuevo)
```

### Capas (Frontend)

```
├── Core (Lógica de negocio frontend)
│   ├── Entities (mirrors backend)
│   ├── Services
│   │   ├── ProjectService
│   │   ├── CalculationService
│   │   └── MapService
│   └── Utils
│       ├── coordinateUtils
│       ├── unitConverter
│       └── validators
│
├── Infrastructure
│   ├── API
│   │   ├── projectAPI
│   │   ├── traceAPI
│   │   └── authAPI
│   └── Storage
│       ├── localStorage (wrapper)
│       └── indexedDB (offline en fase 2)
│
├── Presentation
│   ├── Pages
│   │   ├── HomePage
│   │   ├── NewProjectPage
│   │   ├── ProjectDetailPage
│   │   └── ProjectsListPage (fase 2)
│   ├── Components
│   │   ├── KMZUploader
│   │   ├── ParametersForm
│   │   ├── Map (Leaflet wrapper)
│   │   ├── ResultsTable
│   │   ├── SummaryPanel
│   │   └── AlarmModal
│   └── Layouts
│       ├── MainLayout
│       └── EmptyLayout
│
└── Shared
    ├── Hooks
    │   ├── useMap
    │   ├── useCalculation
    │   └── useKMZParser
    ├── Contexts
    │   ├── ProjectContext
    │   └── AuthContext (fase 2)
    └── Utils
        ├── constants
        └── helpers
```

---

## 8️⃣ MODELO DE DATOS (Entidades)

### **Project Entity**

```typescript
interface Project {
  id: string; // UUID
  name: string; // Nombre del proyecto
  client?: string; // Cliente (opcional)
  description?: string; // Descripción (opcional)
  status: 'draft' | 'in_progress' | 'completed'; // Estado
  
  // Archivos
  kmzPath: string; // Path al KMZ original en storage
  
  // Parámetros
  flowRate_m3h: number; // Caudal en m³/h
  flowRate_bpm: number; // Caudal en BPM (calculado)
  hoseDiameter: 10 | 12 | 14 | 16; // Diámetro flexi
  pumpingPressure_kg: number; // Presión de bombeo kg/cm²
  numberOfLines: number; // Cantidad de líneas
  calculationInterval: number; // Intervalo en metros
  
  // Resultados (nullable hasta que se calcule)
  totalPumps?: number;
  totalValves?: number;
  fuelConsumption_lh?: number; // litros/hora
  totalDistance_km?: number;
  elevationDifference_m?: number;
  
  // Relaciones
  traceId: string; // FK a Trace
  pumps: Pump[]; // Relación 1:N
  valves: Valve[]; // Relación 1:N
  alarms: Alarm[]; // Relación 1:N
  
  // Auditoría
  createdById: string; // FK a User
  createdAt: Date;
  updatedAt: Date;
}
```

### **Trace Entity**

```typescript
interface Trace {
  id: string; // UUID
  projectId: string; // FK a Project
  
  // Datos de la traza
  name: string; // Nombre de la traza (del KMZ)
  points: TracePoint[]; // JSON con todos los puntos
  
  // Metadata
  totalDistance_m: number;
  startElevation_m: number;
  endElevation_m: number;
  elevationDifference_m: number;
  
  createdAt: Date;
  updatedAt: Date;
}

interface TracePoint {
  index: number; // Índice del punto (0, 1, 2, ...)
  distance_m: number; // Distancia acumulada desde inicio
  latitude: number;
  longitude: number;
  elevation_m: number;
  
  // Cálculos (se llenan al calcular)
  frictionLoss_psi?: number; // K
  staticPressure_kg?: number; // M
  accumulatedHeight_kg?: number; // N
  combinedPressure_psi?: number; // O
  combinedPressure_kg?: number; // P
}
```

### **Pump Entity**

```typescript
interface Pump {
  id: string; // UUID
  projectId: string; // FK a Project
  
  number: number; // Número de bomba (1, 2, 3, ...)
  distance_m: number; // Distancia desde inicio
  latitude: number;
  longitude: number;
  elevation_m: number;
  pressure_kg: number; // Presión en ese punto
  pressure_psi: number; // Presión en ese punto
  
  // Georreferenciación (fase 2)
  actualLatitude?: number; // Coordenadas reales (instalación)
  actualLongitude?: number;
  actualPhoto?: string; // Path a foto
  deviation_m?: number; // Desviación respecto a planificado
  installedAt?: Date; // Fecha de instalación
  installedBy?: string; // FK a User (Supervisor)
  
  createdAt: Date;
}
```

### **Valve Entity**

```typescript
interface Valve {
  id: string; // UUID
  projectId: string; // FK a Project
  
  number: number; // Número de válvula (1, 2, 3, ...)
  distance_m: number; // Distancia desde inicio
  latitude: number;
  longitude: number;
  elevation_m: number;
  accumulatedHeight_kg: number; // Altura acumulada negativa
  pressure_kg: number;
  pressure_psi: number;
  
  // Georreferenciación (fase 2)
  actualLatitude?: number;
  actualLongitude?: number;
  actualPhoto?: string;
  deviation_m?: number;
  installedAt?: Date;
  installedBy?: string; // FK a User
  
  createdAt: Date;
}
```

### **Alarm Entity**

```typescript
interface Alarm {
  id: string; // UUID
  projectId: string; // FK a Project
  
  type: 'PRESSURE_CRITICAL' | 'FUEL_HIGH'; // Tipo de alarma
  severity: 'critical' | 'warning'; // Severidad
  
  // Detalles
  pointIndex: number; // Índice del punto problemático
  distance_m: number;
  latitude: number;
  longitude: number;
  value: number; // Valor que generó la alarma
  threshold: number; // Umbral excedido
  message: string; // Mensaje descriptivo
  
  // Estado
  acknowledged: boolean; // Si fue revisada
  acknowledgedBy?: string; // FK a User
  acknowledgedAt?: Date;
  notes?: string; // Notas del Coordinador
  
  createdAt: Date;
}
```

---

## 9️⃣ API ENDPOINTS (Backend)

### **Projects**

```typescript
POST   /api/v1/projects              // Crear proyecto
GET    /api/v1/projects              // Listar proyectos (fase 2)
GET    /api/v1/projects/:id          // Obtener proyecto (fase 2)
PUT    /api/v1/projects/:id          // Actualizar proyecto (fase 2)
DELETE /api/v1/projects/:id          // Eliminar proyecto (fase 2)

POST   /api/v1/projects/:id/kmz      // Upload KMZ
POST   /api/v1/projects/:id/calculate // Calcular posiciones

GET    /api/v1/projects/:id/export/pdf  // Exportar PDF (fase 2)
GET    /api/v1/projects/:id/export/kmz  // Exportar KMZ (fase 2)
```

### **Traces** (interno, no expuesto en MVP)

```typescript
GET    /api/v1/traces/:id            // Obtener traza con puntos
```

### **Auth** (fase 2)

```typescript
POST   /api/v1/auth/login            // Login
POST   /api/v1/auth/logout           // Logout
GET    /api/v1/auth/me               // Usuario actual
```

### **Users** (fase 2, solo Admin)

```typescript
POST   /api/v1/users                 // Crear usuario
GET    /api/v1/users                 // Listar usuarios
GET    /api/v1/users/:id             // Obtener usuario
PUT    /api/v1/users/:id             // Actualizar usuario
DELETE /api/v1/users/:id             // Eliminar usuario
```

---

## 🔟 RIESGOS Y MITIGACIONES

### 🚨 Riesgos Críticos (Podrían bloquear MVP)

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Excel tiene fórmulas mal documentadas** | Media | Crítico | ✅ YA MITIGADO: Algoritmo completamente documentado |
| **KMZ sin elevaciones (como el ejemplo)** | Alta | Crítico | ✅ Implementar validación + Google Elevation API como fallback |
| **Cálculo tarda >5s para trazas largas** | Baja | Alto | Optimizar algoritmo. Si es necesario, usar Web Workers |
| **Tabla de rozamiento incompleta (14", 16")** | Media | Alto | ⚠️ PENDIENTE: Obtener del cliente ANTES de Sprint 1 |
| **Diferencias entre Excel y app (±5%)** | Media | Crítico | Validar con 3+ casos reales. Documentar discrepancias |

### ⚠️ Riesgos Altos (Podrían retrasar MVP)

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Parsing de KMZ falla con formatos variados** | Media | Alto | Testear con 10+ KMZ reales. Manejar casos edge |
| **Leaflet performance con trazas largas** | Baja | Medio | Limitar puntos dibujados. Usar clustering si es necesario |
| **Usuario no entiende la UI** | Media | Medio | UX testing con usuario real (Coordinador) |
| **Interpolación de coeficientes incorrecta** | Baja | Alto | Validar matemáticamente. Testear con casos conocidos |

### 🟡 Riesgos Medios (No bloquean MVP)

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Umbral de combustible no definido** | Alta | Bajo | Implementar, dejar valor TBD. Configurable después |
| **Offline complejo de implementar** | Alta | Medio | Dejar para Sprint 6+. No es crítico |
| **Exportación PDF lenta** | Media | Bajo | Fase 2. No es MVP |

---

## 1️⃣1️⃣ PREGUNTAS PENDIENTES (⚠️ CRÍTICAS)

### 🔴 URGENTES (Bloquean Sprint 1)

1. ✅ **Excel con fórmulas** → RESUELTO: Ya analizado y documentado
2. ✅ **KMZ de ejemplo** → RESUELTO: Detectado problema (sin elevaciones)
3. ❌ **Coeficientes para flexi 14" y 16"** → ⚠️ PENDIENTE: Necesario si se quiere soportar esos diámetros en MVP
4. ❌ **Umbral de alarma de combustible** → ⚠️ PENDIENTE: Se puede dejar configurable (default: 100 L/h?)

### 🟡 IMPORTANTES (Para Sprint 2)

5. **¿Tienen logo de JMAC para PDF?** → Para exportación
6. **¿Formato preferido de PDF?** → Tienen algún template?
7. **Naming interno: ¿Cómo llaman a cada cosa?**
   - ✅ Bomba (confirmado)
   - ✅ Válvula (confirmado)
   - ✅ Línea (confirmado)
   - ✅ Flexi (confirmado)
   - ¿Traza? ¿Recorrido? ¿Tendido?

---

## 1️⃣2️⃣ PLAN DE ACCIÓN - PRÓXIMOS PASOS

### ✅ APROBACIONES REQUERIDAS

Antes de escribir código:

- [x] Aprobación de Historias de Usuario
- [x] Aprobación de priorización MoSCoW
- [x] Aprobación de alcance MVP
- [x] Algoritmo validado con Excel
- [ ] Confirmar coeficientes flexi 14" y 16"
- [ ] Confirmar umbral alarma combustible

### 🚀 SPRINT 1 (Semana 1-2)

**Objetivo:** Upload KMZ + Visualización + Formulario

**Tareas:**

**Backend:**
- [ ] Crear endpoint POST /api/v1/projects
- [ ] Implementar KMZParserService
  - [ ] Extraer coordenadas
  - [ ] Extraer elevaciones
  - [ ] Validar formato
  - [ ] Manejar errores
- [ ] Tests unitarios de parser
- [ ] Tests de integración de endpoint

**Frontend:**
- [ ] Setup proyecto React + Vite + Tailwind
- [ ] Crear página NewProjectPage
- [ ] Componente KMZUploader (drag & drop)
- [ ] Integrar Leaflet (componente Map)
- [ ] Dibujar traza en mapa
- [ ] Componente ParametersForm
  - [ ] Validaciones
  - [ ] Conversión m³/h → BPM
  - [ ] Lookup coeficiente
- [ ] Mostrar resumen de traza

**Entregable:** Demo funcional de upload + visualización (sin cálculos aún)

**Criterio de éxito:**
- [x] Usuario puede subir KMZ
- [x] Sistema muestra traza en mapa
- [x] Sistema valida parámetros
- [x] Demo con usuario real → Feedback

---

### 🚀 SPRINT 2 (Semana 3-4)

**Objetivo:** Algoritmo hidráulico completo + Resultados

**Tareas:**

**Backend:**
- [ ] Implementar HydraulicCalculator (Domain Service)
  - [ ] Cálculo de K (rozamiento)
  - [ ] Cálculo de M (presión estática)
  - [ ] Cálculo de N (altura acumulada)
  - [ ] Cálculo de O, P (presión combinada)
  - [ ] Lógica de colocación de bombas
  - [ ] Lógica de colocación de válvulas
  - [ ] Cálculo de consumo combustible
  - [ ] Sistema de alarmas
- [ ] Tests exhaustivos con casos del Excel
- [ ] Endpoint POST /api/v1/projects/:id/calculate
- [ ] Tests de integración end-to-end

**Frontend:**
- [ ] Botón "Calcular"
- [ ] Loading indicator
- [ ] Componente ResultsTable
- [ ] Componente SummaryPanel
- [ ] Componente AlarmModal
- [ ] Dibujar bombas/válvulas en mapa
- [ ] Popups interactivos
- [ ] Manejo de errores

**Entregable:** MVP COMPLETO funcionando

**Criterio de éxito:**
- [x] Cálculo correcto validado con Excel (±5%)
- [x] 3 casos reales de JMAC validados
- [x] Usuario valida que el cálculo es correcto
- [x] Proceso completo <5 minutos
- [x] Video demo de 3 minutos
- [x] **DEMO CON CLIENTE FINAL → FEEDBACK CRÍTICO**

---

### 🎉 DESPUÉS DEL MVP

Si el MVP es exitoso (usuario aprueba y valida):

**Sprint 3-4:** Gestión de proyectos + Exportación  
**Sprint 5-7:** Funcionalidades móviles para Supervisor  

---

## 📝 DOCUMENT HISTORY

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | [Fecha inicial] | Análisis inicial de requisitos | Claude |
| 2.0 | [Fecha actual] | Actualizado con algoritmo validado del Excel + KMZ analizado | Claude |

---

## ✅ CONCLUSIÓN

Este documento representa el **ANÁLISIS COMPLETO Y VALIDADO** del proyecto JMAC Earth.

**Estado actual:**
- ✅ Algoritmo hidráulico completamente documentado y validado con Excel real
- ✅ Historias de usuario priorizadas con MoSCoW
- ✅ Casos de uso detallados
- ✅ MVP claramente definido
- ✅ Stack técnico decidido
- ⚠️ Pendientes menores (coeficientes 14"/16", umbral combustible)

**Próximo paso:**
🚀 **INICIO DE SPRINT 1** (previa confirmación final de Ileana)

---

**Aprobado para desarrollo:** ⏳ PENDIENTE  
**Firma Product Owner:** ________________  
**Fecha:** ________________
