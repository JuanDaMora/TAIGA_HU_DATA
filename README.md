# Taiga HU States

**Autor:** Juan David Morantes Vergara

Este proyecto permite consultar información de Sprints y User Stories desde la API de Taiga, generando archivos de salida que registran datos relevantes del proyecto. Está desarrollado en **TypeScript** y utiliza solicitudes HTTPS para interactuar con la API de Taiga.

## 📋 Descripción

El proyecto `Taiga_HU_states` es una herramienta de análisis que:

- **Consulta sprints** de un proyecto específico de Taiga
- **Extrae user stories** asociadas a cada sprint
- **Genera historial de estados** de cada user story
- **Exporta datos** en formato de texto para análisis posterior

## 🏗️ Arquitectura del Proyecto

```
Taiga_HU_states/
├── src/
│   ├── interfaces/
│   │   ├── consulta_sprint.interface.ts    # Interfaces para sprints
│   │   ├── consulta_status.interface.ts    # Interfaces para historial
│   │   └── historial-json.interface.ts     # Interfaces para JSON de salida
│   ├── services/
│   │   ├── sprint.service.ts               # Servicio para consultar sprints
│   │   └── userStory.service.ts            # Servicio para historial de US
│   ├── scripts/
│   │   ├── process-historial.ts            # Script de procesamiento y filtrado
│   │   └── generate-dashboard.ts           # Script de generación del dashboard
│   ├── outputs/                            # Carpeta generada con resultados
│   │   ├── front/                          # Dashboard HTML modularizado
│   │   │   ├── dashboard.html              # Plantilla HTML base
│   │   │   ├── css/
│   │   │   │   └── dashboard.css           # Estilos CSS del dashboard
│   │   │   ├── js/
│   │   │   │   └── dashboard.js            # Funcionalidad JavaScript
│   │   │   └── README.md                   # Documentación del frontend
│   │   ├── json/                           # Archivos JSON estructurados
│   │   └── txt/                            # Archivos de texto plano
│   └── main.ts                             # Punto de entrada principal
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- Yarn o npm
- Acceso a un servidor Taiga con API habilitada

## 📊 Actualización de Datos

### ⚠️ Importante: Actualización de Datos

Cuando cambias datos en Taiga (nuevas User Stories, cambios de estado, etc.), **debes ejecutar el pipeline completo** para que el dashboard refleje los cambios:

```bash
# Opción 1: Actualización completa (recomendado)
yarn update

# Opción 2: Actualización y servir automáticamente
yarn update-and-serve

# Opción 3: Pipeline completo con servidor
yarn full-pipeline
```

### 🔄 Flujo de Actualización

1. **`yarn start`** - Consulta datos actuales de Taiga
2. **`yarn process`** - Procesa y genera archivos JSON
3. **`yarn dashboard`** - Regenera el dashboard con datos actualizados
4. **`yarn serve`** - Sirve el dashboard (opcional)

### 📈 Verificación de Actualización

Después de ejecutar la actualización, verifica que los números en el dashboard hayan cambiado:
- Total User Stories
- Completadas
- En Progreso
- Promedio de Edad
- Distribución por estado

### Pasos de Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/Judamov/Taiga_HU_states.git
cd Taiga_HU_states
```

2. **Instala las dependencias:**
```bash
# Con yarn (recomendado)
yarn install

# O con npm
npm install
```

3. **Configura las variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
HOST_NAME=tu-servidor-taiga.com
TOKEN=tu-token-de-autorizacion
PROYECT_TAIGA=123
```

### ⚠️ Importante: Certificado SSL

Si el certificado SSL del servidor Taiga está vencido, ejecuta este comando antes de usar la aplicación:

```bash
# En Linux/Mac
export NODE_TLS_REJECT_UNAUTHORIZED="0"

# En Windows PowerShell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"

# En Windows CMD
set NODE_TLS_REJECT_UNAUTHORIZED=0
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `HOST_NAME` | Dominio del servidor Taiga | `taiga.miempresa.com` |
| `TOKEN` | Token de autorización de la API | `Bearer tu-token-aqui` |
| `PROYECT_TAIGA` | ID del proyecto en Taiga | `123` |

### Obtención del Token

1. Inicia sesión en tu instancia de Taiga
2. Ve a tu perfil de usuario
3. En la sección "API", genera un nuevo token
4. Copia el token y úsalo en la variable `TOKEN`

## 🏃‍♂️ Uso

### Flujo de Trabajo Completo

```bash
# 1. Generar historial base (consulta API de Taiga)
yarn start

# 2. Procesar y filtrar user stories (opcional)
yarn process

# 3. Generar dashboard interactivo (opcional)
yarn dashboard

# O ejecutar todo el flujo completo:
yarn full-report
```

### Scripts Disponibles

```bash
# Compilar TypeScript
yarn build

# Ejecutar programa principal (consulta API y genera historial)
yarn start

# Debug de peticiones HTTP (para troubleshooting)
yarn debug

# Procesar historial JSON (filtrar y ordenar user stories)
yarn process

# Generar dashboard HTML interactivo
yarn dashboard

# Generar reporte completo (datos + procesamiento + dashboard)
yarn full-report

# Servidor local para dashboard (evita problemas CORS)
yarn serve

# Generar dashboard + servidor automático
yarn serve-dashboard
```

### Ejecución Individual

```bash
# Solo compilar
yarn build

# Solo ejecutar (requiere compilación previa)
node dist/main.js

# Solo procesar historial (requiere historial.json previo)
node dist/scripts/process-historial.js

# Solo generar dashboard (requiere user_stories_report.json previo)
node dist/scripts/generate-dashboard.js
```

### 🚀 Abrir el Dashboard

#### ⚠️ Importante: Problema de CORS
Los navegadores modernos bloquean las peticiones AJAX a archivos locales por seguridad. **No abras el archivo HTML directamente**.

#### ✅ Soluciones Recomendadas:

**Opción 1: Servidor Local (Recomendado)**
```bash
# Generar dashboard y abrir servidor automáticamente
yarn serve-dashboard

# O manualmente:
yarn dashboard
yarn serve
```
Luego abre: http://localhost:8080

**Opción 2: Live Server (VS Code)**
- Instala la extensión "Live Server"
- Click derecho en `dashboard.html` → "Open with Live Server"

**Opción 3: Servidor HTTP Manual**
```bash
# Instalar servidor global
npm install -g http-server

# Navegar a la carpeta y ejecutar
cd src/outputs/front
http-server -p 8080 -o
```

#### ❌ No Funciona:
- Abrir `dashboard.html` directamente con doble click
- Usar protocolo `file://`

## 📊 Salida del Programa

### Archivos Generados por `yarn start`

El programa principal genera archivos organizados en carpetas por tipo:

#### 📁 `src/outputs/txt/` - Archivos de Texto

##### 1. `sprints_log.txt`
Contiene información detallada de cada sprint:
```
Sprint ID: 123 - Sprint 1
  - User Story ref: 456 | subject: Implementar login
  - User Story ref: 457 | subject: Crear dashboard
```

##### 2. `user_story_ids.txt`
Lista de IDs de todas las user stories encontradas:
```
456
457
458
```

##### 3. `historial_estados.txt`
Historial cronológico de cambios de estado de cada user story:
```
Story ref: 456 - Implementar login | Date: 2024-01-15T10:30:00Z | Status: En Progreso
Story ref: 456 - Implementar login | Date: 2024-01-16T14:20:00Z | Status: Terminado
```

#### 📁 `src/outputs/json/` - Archivos JSON

##### 4. `historial.json`
Historial estructurado en formato JSON con la siguiente estructura:
```json
[
  {
    "created_date": "2025-07-15",
    "modified_date": "2025-07-20",
    "name": "456 - Implementar login",
    "ref": 456,
    "subject": "Implementar login",
    "status": "En Progreso"
  },
  {
    "created_date": "2025-07-24",
    "modified_date": "2025-07-25",
    "name": "457 - Crear dashboard",
    "ref": 457,
    "subject": "Crear dashboard",
    "status": "Terminado"
  }
]
```

### Archivos Generados por `yarn process`

El script de procesamiento genera archivos adicionales organizados por tipo:

### Archivos Generados por `yarn dashboard`

El script de dashboard genera una visualización HTML interactiva modularizada:

#### 📁 `src/outputs/front/` - Dashboard Frontend Modularizado

##### 1. `dashboard.html`
Plantilla HTML base con placeholders para datos dinámicos:
- **Estructura semántica**: HTML5 semántico y accesible
- **Placeholders**: Sistema de plantillas para inserción de datos
- **Referencias externas**: CSS y JS separados para modularidad
- **Responsive design**: Optimizado para todos los dispositivos

##### 2. `css/dashboard.css`
Estilos CSS completos del dashboard:
- **Material Design**: Paleta de colores y componentes consistentes
- **Animaciones**: Transiciones suaves y efectos visuales
- **Media queries**: Diseño responsive para móvil, tablet y desktop
- **Estilos de impresión**: Optimizado para impresión

##### 3. `js/dashboard.js`
Funcionalidad JavaScript completa:
- **Carga dinámica**: Datos desde JSON con manejo de errores
- **Filtros interactivos**: Búsqueda y filtrado en tiempo real
- **Ordenamiento**: Tablas ordenables por columnas
- **Exportación**: Funciones para CSV y JSON
- **Gráficos**: Integración con Chart.js para visualizaciones

##### 4. `README.md`
Documentación técnica del frontend:
- Guía de desarrollo y personalización
- Estructura de archivos y componentes
- Compatibilidad y debugging
- Optimizaciones y mejores prácticas

#### 📁 `src/outputs/json/` - Archivos JSON de Análisis

##### 1. `user_stories_report.json`
Reporte general con estadísticas y user stories procesadas:
```json
{
  "current_year": 2025,
  "total_user_stories": 15,
  "old_user_stories": [...],
  "recent_user_stories": [...],
  "ignored_previous_year": 3
}
```

##### 2. `old_user_stories.json`
User stories con más de 5 meses de antigüedad:
```json
[
  {
    "ref": 456,
    "subject": "Implementar login",
    "name": "456 - Implementar login",
    "created_date": "2025-01-15",
    "modified_date": "2025-07-20",
    "status": "En Progreso",
    "age_in_months": 8,
    "is_old": true
  }
]
```

##### 3. `recent_user_stories.json`
User stories con 5 meses o menos de antigüedad.

#### 📁 `src/outputs/txt/` - Archivos de Texto de Análisis

##### 4. `user_stories_summary.txt`
Resumen en texto plano con estadísticas y listas organizadas por estado y mes:
```
=== REPORTE DE USER STORIES ===
Fecha de procesamiento: 2025-07-29T15:56:22.576Z
Año actual: 2025

📈 ESTADÍSTICAS GENERALES:
- Total User Stories únicas: 48
- User Stories antiguas (>5 meses): 0
- User Stories recientes (≤5 meses): 48
- Entradas ignoradas (año anterior): 0

📋 USER STORIES RECIENTES (≤5 meses) - CLASIFICADAS POR ESTADO:
  📌 Develop in progress (6):
    📅 Marzo 2025 (1):
      - Ref: 970 | Estandarización y Mejora del Flujo de Desarrollo | Creada: 2025-03-28 | Edad: 4 meses
    📅 Julio 2025 (2):
      - Ref: 1231 | Reportes evaluación docente para vicerrector/decano | Creada: 2025-07-17 | Edad: 0 meses

  📌 In QA / UX Test (1):
    📅 Julio 2025 (1):
      - Ref: 1145 | Generación y descarga de reportes de evaluación docente | Creada: 2025-07-23 | Edad: 0 meses

  🏁 === USER STORIES COMPLETADAS ===

  📌 Done (36):
    📅 Marzo 2025 (8):
      - Ref: 905 | Implementación de Ejemplos de Consumo de Endpoints | Creada: 2025-03-14 | Edad: 4 meses
```

##### 5. `user_stories_history.txt`
Historial cronológico de user stories recientes ordenadas por fecha de creación:
```
=== HISTORIAL CRONOLÓGICO DE USER STORIES RECIENTES ===
Fecha de procesamiento: 2025-07-29T15:56:22.576Z
Año actual: 2025
Total User Stories recientes: 48

📋 HISTORIAL ORDENADO POR FECHA DE CREACIÓN (MÁS ANTIGUA → MÁS RECIENTE):
1. Ref: 905 | Implementación de Ejemplos de Consumo de Endpoints con API Key
   📅 Creada: 2025-03-14
   📊 Estado actual: Done
   ⏰ Edad: 4 meses
   📝 Última modificación: 2025-03-21
```

##### 6. `user_stories_detailed_history.txt`
Historial detallado con todos los cambios de estado de cada user story:
```
=== HISTORIAL DETALLADO DE CAMBIOS DE ESTADO - USER STORIES RECIENTES ===
Fecha de procesamiento: 2025-07-29T15:56:22.576Z
Año actual: 2025
Total User Stories recientes: 48

📋 CAMBIOS DE ESTADO ORDENADOS POR FECHA DE CREACIÓN (MÁS ANTIGUA → MÁS RECIENTE):
1. Ref: 1231 | Reportes evaluación docente para vicerrector/decano
   📅 Creada: 2025-07-17
   📊 Estado actual: Develop in progress
   ⏰ Edad: 0 meses
   📝 Última modificación: 2025-07-17
   🔄 Cambios de estado (15):
      1. 2025-07-15 → Open / Ready for sprint
      2. 2025-07-17 → Develop in progress
```

## 🔍 Funcionalidades

### Consulta de Sprints
- Obtiene todos los sprints del proyecto especificado
- Filtra sprints cerrados automáticamente
- Extrae user stories asociadas a cada sprint

### Análisis de User Stories
- Recopila metadatos de cada user story (ref, subject)
- Consulta el historial completo de cambios de estado
- Genera timeline de evolución de estados
- Procesa y filtra user stories por antigüedad y criterios específicos

### Procesamiento Avanzado
- **Elimina duplicados**: Usa referencias únicas para evitar repeticiones
- **Ordena por antigüedad**: User stories más antiguas primero
- **Filtra por edad**: Separa user stories > 5 meses vs ≤ 5 meses
- **Ignora año anterior**: Solo procesa datos del año actual
- **Calcula estadísticas**: Edad en meses, conteos, etc.
- **Agrupa por mes**: Organiza user stories por mes de creación dentro de cada estado
- **Prioriza estados activos**: User stories "Done" aparecen al final, estados en progreso primero
- **Marca visual**: Separador claro entre user stories completadas y en progreso
- **Estado más reciente**: Captura el estado actual correcto de cada user story

### Exportación de Datos
- Genera archivos de texto legibles
- Organiza información de forma estructurada
- Facilita análisis posterior de datos
- Exporta historial en formato JSON para integración con otras herramientas
- Crea reportes específicos para análisis de antigüedad
- **Reporte resumido**: Clasificación por estado con agrupación mensual
- **Reporte cronológico**: Lista ordenada por fecha de creación
- **Reporte detallado**: Historial completo de cambios de estado con fechas

## 🛠️ Tecnologías Utilizadas

- **TypeScript**: Lenguaje principal del proyecto
- **Node.js**: Runtime de JavaScript
- **dotenv**: Gestión de variables de entorno
- **HTTPS**: Comunicación con API de Taiga
- **File System**: Escritura de archivos de salida

## 📁 Estructura de Interfaces

### Sprint Interface (`consulta_sprint.interface.ts`)
```typescript
interface Sprints {
  id: number;
  name: string;
  project: number;
  user_stories: UserStory[];
  // ... más propiedades
}
```

### User Story History Interface (`consulta_status.interface.ts`)
```typescript
interface Hu {
  id: string;
  created_at: Date;
  values: Values;
  // ... más propiedades
}
```

### Historial JSON Interface (`historial-json.interface.ts`)
```typescript
interface HistorialEntry {
  created_date: string;
  modified_date: string;
  name: string;
  ref: number;
  subject: string;
  status?: string;
}
```

### Processed User Story Interface (`process-historial.ts`)
```typescript
interface ProcessedUserStory {
  ref: number;
  subject: string;
  name: string;
  created_date: string;
  modified_date: string;
  status?: string;
  age_in_months: number;
  is_old: boolean;
}
```

## 🔧 Desarrollo

### Compilación
```bash
# Compilar TypeScript a JavaScript
yarn build
```

### Estructura de Desarrollo
- **Interfaces**: Definiciones de tipos TypeScript
- **Servicios**: Lógica de comunicación con API
- **Scripts**: Procesamiento y análisis de datos
- **Main**: Orquestación del flujo principal

### Flujo de Desarrollo
1. **Consulta API** → Obtiene datos de Taiga
2. **Procesamiento** → Genera historial JSON
3. **Análisis** → Filtra y ordena user stories
4. **Reportes** → Genera archivos de salida

## 🐛 Solución de Problemas

### Error de Certificado SSL
Si encuentras errores de certificado SSL:
```bash
export NODE_TLS_REJECT_UNAUTHORIZED="0"
```

**Nota:** El proyecto ahora incluye configuración automática para manejar certificados SSL expirados en los servicios.

### Debugging Detallado
Para obtener información detallada de las peticiones HTTP:

```bash
# Ejecutar herramienta de debug
yarn debug
```

Esto te mostrará:
- URLs completas de las peticiones
- Headers enviados
- Códigos de estado HTTP
- Respuestas del servidor
- Errores detallados de conexión

### Error de Variables de Entorno
Asegúrate de que todas las variables estén definidas:
- `HOST_NAME`
- `TOKEN`
- `PROYECT_TAIGA`

### Error de Conexión
Verifica:
- Que el servidor Taiga esté accesible
- Que el token sea válido
- Que el ID del proyecto exista

### Error de Procesamiento
Si `yarn process` falla:
- Verifica que existe `src/outputs/json/historial.json`
- Ejecuta `yarn start` primero para generar el historial
- Revisa que las fechas en el JSON sean válidas

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo o abre un issue en el repositorio.

## 📋 Checklist de Uso

### Configuración Inicial
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Dependencias instaladas (`yarn install`)
- [ ] Certificado SSL configurado (si es necesario)

### Ejecución
- [ ] Generar historial base (`yarn start`)
- [ ] Procesar y filtrar datos (`yarn process`)
- [ ] Revisar archivos generados en `src/outputs/`

### Verificación
- [ ] Archivos de salida creados correctamente
- [ ] Carpetas `json/` y `txt/` organizadas
- [ ] Datos en formato esperado
- [ ] Estadísticas coherentes en reportes
