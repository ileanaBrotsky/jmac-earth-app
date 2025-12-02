# 🔬 ALGORITMO HIDRÁULICO - JMAC EARTH

## 📊 ANÁLISIS COMPLETO DEL EXCEL ACTUAL

### ✅ VALIDADO CON: Calculo_consumo_Port-Sierra_Chata_rev1_original_no_tocar.xlsx

---

## 1️⃣ TABLA DE COEFICIENTES DE ROZAMIENTO

### Flexi 12" (Diámetro 12 pulgadas)

| BPM | Coeficiente |
|-----|-------------|
| 12  | 0.026 |
| 13  | 0.030 |
| 14  | 0.039 |
| 15  | 0.048 |
| 17  | 0.056 |
| 18  | 0.065 |
| 19  | 0.074 |
| 20  | 0.082 |
| 21  | 0.091 |
| 23  | 0.100 |
| 24  | 0.113 |
| 26  | 0.130 |
| 29  | 0.152 |
| 31  | 0.173 |
| 33  | 0.199 |
| 36  | 0.229 |
| 38  | 0.260 |
| 40  | 0.377 |
| 43  | 0.325 |
| 45  | 0.359 |
| 48  | 0.398 |
| 60  | 0.628 |
| 71  | 0.887 |
| 83  | 1.190 |

### Flexi 10" (Diámetro 10 pulgadas)

| BPM | Coeficiente |
|-----|-------------|
| 12  | 0.069 |
| 13  | 0.082 |
| 14  | 0.090 |
| 15  | 0.112 |
| 17  | 0.129 |
| 18  | 0.151 |
| 19  | 0.168 |
| 20  | 0.190 |
| 21  | 0.212 |
| 23  | 0.233 |
| 24  | 0.260 |
| 26  | 0.311 |
| 29  | 0.367 |
| 31  | 0.429 |
| 33  | 0.498 |
| 36  | 0.558 |
| 38  | 0.636 |
| 40  | 0.718 |
| 43  | 0.797 |
| 45  | 0.887 |
| 48  | 0.978 |
| 60  | 1.560 |
| 71  | 2.200 |
| 83  | 2.970 |

**⚠️ PENDIENTE:** Coeficientes para flexi 14" y 16" (no están en el Excel actual)

---

## 2️⃣ ALGORITMO DE CÁLCULO

### 📥 INPUTS (Parámetros de entrada)

| Parámetro | Unidad | Descripción |
|-----------|--------|-------------|
| `caudal_m3h` | m³/h | Caudal solicitado por el cliente |
| `caudal_bpm` | BPM | Caudal en barriles por minuto (convertir de m³/h) |
| `diametro_flexi` | pulgadas | 8", 10", 12", 14", 16" |
| `presion_bombeo` | kg/cm² | Presión de bombeo (ej: 8 kg/cm²) |
| `num_lineas` | entero | Cantidad de líneas de manguera |
| `intervalo_calculo` | metros | Intervalo de cálculo (ej: 50m, 100m) |

**Conversión caudal:**
```
m³/h → BPM
1 m³/h = 0.1048 BPM
BPM = m³/h * 0.1048

ó usando la fórmula del Excel:
BPM = (m³/h / 24) / 0.156
```

**Si hay múltiples líneas:**
```
caudal_por_linea_bpm = caudal_total_bpm / num_lineas
```

---

### 📍 INPUTS (Del archivo KMZ)

Para cada punto `i` de la traza:
- `distancia_i` (metros): Distancia acumulada desde el inicio
- `elevacion_i` (metros): Altura/altitud sobre el nivel del mar

**⚠️ CRÍTICO:** El KMZ DEBE tener datos de elevación. Si no los tiene:
- Opción A: Regenerar en Google Earth Pro con elevaciones
- Opción B: Usar Google Elevation API

---

### 🧮 FÓRMULAS (Para cada punto i)

#### 1. Pérdida por rozamiento (PSI)

```
K_i = (distancia_i / 1609.34) * (5280 / 100) * coeficiente_rozamiento
```

**Donde:**
- `distancia_i`: Distancia en metros desde el inicio
- `1609.34`: Conversión metros → millas
- `5280`: Pies por milla
- `100`: Constante de la fórmula hidráulica
- `coeficiente_rozamiento`: Obtenido de la tabla según BPM y diámetro

**Obtener coeficiente:**
1. Calcular `caudal_bpm` (considerando múltiples líneas)
2. Buscar en tabla de coeficientes según `caudal_bpm` y `diametro_flexi`
3. Si el BPM no está exacto en la tabla → Interpolar linealmente

---

#### 2. Presión estática (kg/cm²)

```
M_i = -(elevacion_{i-1} - elevacion_i) / 10
```

**Donde:**
- `elevacion_i`: Altura en metros en el punto actual
- `elevacion_{i-1}`: Altura en metros en el punto anterior
- División por 10: Conversión aproximada metros → kg/cm²

**Interpretación:**
- Si `M_i > 0`: Subiendo (presión negativa)
- Si `M_i < 0`: Bajando (presión positiva)

---

#### 3. Altura acumulada (kg/cm²)

```
N_i = N_{i-1} + M_i
```

**Condición inicial:**
```
N_0 = 0  (en el punto de inicio)
```

---

#### 4. Presión combinada (PSI)

**Para el primer punto (i=0):**
```
O_0 = N_0 + K_0
```

**Para los demás puntos (i>0):**
```
O_i = K_i + (N_i * 14.8)
```

**Donde:**
- `14.8`: Factor de conversión kg/cm² → PSI

---

#### 5. Presión combinada (kg/cm²)

```
P_i = O_i / 14.5
```

**Donde:**
- `14.5`: Factor de conversión PSI → kg/cm²

---

### 🔧 LÓGICA DE COLOCACIÓN

#### 🔵 BOMBAS

**Regla Principal:**
- **Bomba 1:** SIEMPRE se coloca en el punto de inicio (i=0)
- **Siguientes bombas:** Cuando `P_i >= presion_bombeo * cantidad_bombas_previas`

**Algoritmo:**
```python
bombas = [0]  # Bomba 1 en punto inicial
ultima_presion_bomba = 0

for i in range(1, num_puntos):
    P_actual = calcular_presion_combinada(i)
    
    # Si llegamos a la presión de la bomba anterior + presión de bombeo
    if P_actual >= ultima_presion_bomba + presion_bombeo:
        bombas.append(i)
        ultima_presion_bomba = P_actual
```

**Ejemplo:**
- Presión de bombeo: 8 kg/cm²
- Bomba 1: en i=0 (P=0)
- Bomba 2: cuando P >= 8 kg/cm²
- Bomba 3: cuando P >= 16 kg/cm²
- Bomba 4: cuando P >= 24 kg/cm²

---

#### 🔴 VÁLVULAS

**Regla Principal:**
- Colocar válvula cuando `N_i < -presion_bombeo`

**Interpretación:**
- Si la altura acumulada negativa supera el límite de presión de bombeo
- Esto ocurre típicamente en descensos pronunciados

**Algoritmo:**
```python
valvulas = []

for i in range(1, num_puntos):
    N_actual = calcular_altura_acumulada(i)
    
    # Si la altura acumulada negativa supera el límite
    if N_actual < -presion_bombeo:
        valvulas.append(i)
```

---

### 🚨 ALARMAS

#### Alarma 1: Presión fuera de límites

```
SI O_i > 200 PSI ó O_i < -200 PSI:
    LANZAR ALERTA CRÍTICA
    MENSAJE: "⚠️ Presión fuera de rango seguro en punto [distancia]m"
```

#### Alarma 2: Consumo excesivo de combustible

```
SI consumo_litros_hora > UMBRAL (POR DEFINIR):
    LANZAR ADVERTENCIA
    MENSAJE: "⚠️ Consumo de combustible elevado: [valor] L/h"
```

**⚠️ PENDIENTE:** Definir umbral de alarma con el cliente.

---

## 3️⃣ CÁLCULO DE CONSUMO DE COMBUSTIBLE

### Fórmulas del Excel:

```
1. Potencia (HP):
   Potencia_HP = (caudal_m3s * (altura_bombeo + perdida_linea) * gravedad * densidad) / 745.7

2. Consumo (kg/hora):
   Consumo_kg_h = (consumo_gramos_hp * Potencia_HP) / 1000

3. Consumo (litros/hora):
   Consumo_L_h = Consumo_kg_h / densidad_diesel
```

**Constantes:**
- `gravedad`: 9.81 m/s²
- `densidad_agua`: 1000 kg/m³
- `consumo_gramos_hp`: 191 gramos/HP (parámetro del Excel)
- `densidad_diesel`: 0.832 kg/L
- `745.7`: Factor de conversión a HP

**Variables:**
- `caudal_m3s`: Caudal en m³/segundo (convertir de m³/h)
- `altura_bombeo`: Diferencia de altura total (elevacion_fin - elevacion_inicio)
- `perdida_linea`: Pérdida por rozamiento total (metros)

---

## 4️⃣ OUTPUTS (Resultados esperados)

### Para cada BOMBA detectada:

```json
{
  "tipo": "BOMBA",
  "numero": 1,
  "distancia_metros": 0,
  "coordenadas": {
    "latitud": -38.233023,
    "longitud": -68.629742
  },
  "elevacion_metros": 545,
  "presion_kg_cm2": 0,
  "presion_psi": 0
}
```

### Para cada VÁLVULA detectada:

```json
{
  "tipo": "VALVULA",
  "numero": 1,
  "distancia_metros": 1500,
  "coordenadas": {
    "latitud": -38.235310,
    "longitud": -68.627113
  },
  "elevacion_metros": 508,
  "altura_acumulada_kg_cm2": -9.2,
  "presion_psi": -136.5
}
```

### Resumen general:

```json
{
  "total_bombas": 5,
  "total_valvulas": 2,
  "distancia_total_km": 47.7,
  "desnivel_metros": 43,
  "consumo_combustible_litros_hora": 85.2,
  "alarmas": [
    {
      "tipo": "PRESION_CRITICA",
      "punto_km": 12.5,
      "valor_psi": 215,
      "mensaje": "Presión excede límite de seguridad"
    }
  ]
}
```

---

## 5️⃣ ESTRUCTURA DEL KMZ

### Formato esperado:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Traza LGA</name>
    <Placemark>
      <name>Traza LGA</name>
      <LineString>
        <coordinates>
          -68.629742,--38.233023,545
          -68.627113,-38.235310,535
          -68.625854,-38.235570,518
          ...
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>
```

**Formato de coordenadas:**
```
longitud,latitud,elevacion
```

**⚠️ CRÍTICO:**
- Cada línea = 1 punto
- Separadores: comas (,)
- Elevación en metros
- Si elevación = 0 → KMZ SIN elevaciones (requiere API externa)

---

## 6️⃣ PSEUDOCÓDIGO COMPLETO

```python
def calcular_posiciones_bombas_valvulas(kmz_file, parametros):
    """
    Algoritmo completo de cálculo hidráulico
    """
    # 1. PARSEAR KMZ
    puntos = parsear_kmz(kmz_file)
    # puntos = [
    #   {distancia: 0, lat: -38.23, lon: -68.62, elevacion: 545},
    #   {distancia: 500, lat: -38.24, lon: -68.61, elevacion: 535},
    #   ...
    # ]
    
    # 2. AJUSTAR CAUDAL SI HAY MÚLTIPLES LÍNEAS
    caudal_bpm = parametros.caudal_m3h * 0.1048
    if parametros.num_lineas > 1:
        caudal_bpm = caudal_bpm / parametros.num_lineas
    
    # 3. OBTENER COEFICIENTE DE ROZAMIENTO
    coeficiente = obtener_coeficiente_rozamiento(
        caudal_bpm, 
        parametros.diametro_flexi
    )
    
    # 4. CALCULAR VALORES PARA CADA PUNTO
    resultados = []
    N_acumulado = 0  # Altura acumulada inicial
    
    for i, punto in enumerate(puntos):
        # Pérdida por rozamiento (PSI)
        K = (punto.distancia / 1609.34) * (5280 / 100) * coeficiente
        
        # Presión estática (kg/cm²)
        if i == 0:
            M = 0
        else:
            elevacion_anterior = puntos[i-1].elevacion
            M = -(elevacion_anterior - punto.elevacion) / 10
        
        # Altura acumulada (kg/cm²)
        N = N_acumulado + M
        N_acumulado = N
        
        # Presión combinada (PSI)
        if i == 0:
            O = N + K
        else:
            O = K + (N * 14.8)
        
        # Presión combinada (kg/cm²)
        P = O / 14.5
        
        resultados.append({
            'distancia': punto.distancia,
            'lat': punto.lat,
            'lon': punto.lon,
            'elevacion': punto.elevacion,
            'K': K,
            'M': M,
            'N': N,
            'O': O,
            'P': P
        })
    
    # 5. IDENTIFICAR BOMBAS
    bombas = [resultados[0]]  # Bomba 1 SIEMPRE en inicio
    ultima_presion_bomba = 0
    
    for i in range(1, len(resultados)):
        P_actual = resultados[i]['P']
        
        if P_actual >= ultima_presion_bomba + parametros.presion_bombeo:
            bombas.append(resultados[i])
            ultima_presion_bomba = P_actual
    
    # 6. IDENTIFICAR VÁLVULAS
    valvulas = []
    
    for i in range(1, len(resultados)):
        N_actual = resultados[i]['N']
        
        if N_actual < -parametros.presion_bombeo:
            valvulas.append(resultados[i])
    
    # 7. DETECTAR ALARMAS
    alarmas = []
    
    for resultado in resultados:
        if resultado['O'] > 200 or resultado['O'] < -200:
            alarmas.append({
                'tipo': 'PRESION_CRITICA',
                'distancia_km': resultado['distancia'] / 1000,
                'valor_psi': resultado['O'],
                'mensaje': 'Presión fuera de rango seguro'
            })
    
    # 8. CALCULAR CONSUMO COMBUSTIBLE
    consumo = calcular_consumo_combustible(
        parametros.caudal_m3h,
        puntos[0].elevacion,
        puntos[-1].elevacion,
        coeficiente
    )
    
    # 9. RETORNAR RESULTADOS
    return {
        'bombas': bombas,
        'valvulas': valvulas,
        'alarmas': alarmas,
        'consumo_litros_hora': consumo,
        'distancia_total_km': puntos[-1].distancia / 1000,
        'desnivel_metros': puntos[-1].elevacion - puntos[0].elevacion
    }
```

---

## 7️⃣ CASOS EDGE Y VALIDACIONES

### ⚠️ Validaciones de entrada:

```python
# Caudal
if caudal_m3h <= 0:
    raise Error("Caudal debe ser mayor a 0")

# Presión de bombeo
if presion_bombeo <= 0:
    raise Error("Presión de bombeo debe ser mayor a 0")

# Número de líneas
if num_lineas < 1:
    raise Error("Debe haber al menos 1 línea")

# Diámetro flexi
if diametro_flexi not in [8, 10, 12, 14, 16]:
    raise Error("Diámetro debe ser 8, 10, 12, 14 o 16 pulgadas")

# Intervalo de cálculo
if intervalo_calculo <= 0:
    raise Error("Intervalo debe ser mayor a 0")
```

### ⚠️ Validaciones de KMZ:

```python
# Tiene coordenadas
if len(puntos) < 2:
    raise Error("KMZ debe tener al menos 2 puntos")

# Tiene elevaciones
if all(punto.elevacion == 0 for punto in puntos):
    raise Warning("KMZ sin elevaciones, usar API externa")

# Distancias crecientes
for i in range(1, len(puntos)):
    if puntos[i].distancia <= puntos[i-1].distancia:
        raise Error("Distancias deben ser crecientes")
```

### ⚠️ Casos especiales:

**Si el BPM no está en la tabla de coeficientes:**
```python
def obtener_coeficiente_rozamiento(bpm, diametro):
    tabla = TABLA_COEFICIENTES[diametro]
    
    # Buscar valor exacto
    if bpm in tabla:
        return tabla[bpm]
    
    # Interpolar linealmente
    bpm_inferior = max([b for b in tabla.keys() if b < bpm])
    bpm_superior = min([b for b in tabla.keys() if b > bpm])
    
    coef_inferior = tabla[bpm_inferior]
    coef_superior = tabla[bpm_superior]
    
    # Interpolación lineal
    proporcion = (bpm - bpm_inferior) / (bpm_superior - bpm_inferior)
    coeficiente = coef_inferior + (coef_superior - coef_inferior) * proporcion
    
    return coeficiente
```

---

## 8️⃣ PROBLEMAS DETECTADOS

### 🚨 CRÍTICO

1. **KMZ sin elevaciones:**
   - El archivo de ejemplo tiene todas las elevaciones en 0
   - SOLUCIÓN: Obtener KMZ con elevaciones O usar Google Elevation API

2. **Tabla de rozamiento incompleta:**
   - Faltan coeficientes para flexi 14" y 16"
   - SOLUCIÓN: Obtener del cliente

3. **Umbral de alarma de combustible:**
   - No está definido
   - SOLUCIÓN: Confirmar con cliente

### ⚠️ IMPORTANTE

4. **Hay dos fórmulas diferentes para O (presión combinada):**
   - Primera fila: `O = N + K`
   - Resto: `O = K + (N * 14.8)`
   - SOLUCIÓN: Validar con cliente cuál es la correcta

5. **Conversión m³/h → BPM:**
   - El Excel usa una fórmula compleja: `BPM = (m³/h / 24) / 0.156`
   - La estándar es: `1 m³/h = 0.1048 BPM`
   - SOLUCIÓN: Validar cuál usar

---

## 9️⃣ PRÓXIMOS PASOS

### ✅ ANTES DE PROGRAMAR:

1. [ ] Confirmar umbral de alarma de combustible
2. [ ] Obtener KMZ con elevaciones válidas
3. [ ] Obtener coeficientes para flexi 14" y 16"
4. [ ] Validar fórmula de presión combinada (primera fila)
5. [ ] Validar fórmula de conversión m³/h → BPM

### 🔥 SPRINT 1 (Semana 1-2):

1. [ ] Parser de KMZ (extraer coordenadas + elevaciones)
2. [ ] Mapa interactivo (Leaflet)
3. [ ] Formulario de parámetros
4. [ ] Validaciones de entrada

### 🔥 SPRINT 2 (Semana 3-4):

1. [ ] Implementar algoritmo hidráulico completo
2. [ ] Lógica de colocación de bombas/válvulas
3. [ ] Visualización de resultados
4. [ ] Testing con caso real

---

## 📝 NOTAS ADICIONALES

- Todas las fórmulas fueron extraídas del Excel actual
- Se validó contra la hoja "400 m3-h" del Excel
- El Excel tiene 3 hojas (400, 500, 600 m³/h) pero todas usan las mismas fórmulas
- Las constantes de conversión pueden tener pequeñas variaciones de redondeo

---

**Documento creado:** {{FECHA}}  
**Autor:** Claude (con análisis de archivos reales)  
**Fuente:** Excel y KMZ proporcionados por JMAC
