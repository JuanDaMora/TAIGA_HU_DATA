# 📁 Estructura del Proyecto Taiga HU States

Esta carpeta contiene el código fuente del proyecto organizado siguiendo las mejores prácticas de infraestructura.

## 🏗️ Estructura de Carpetas

```
src/
├── config/           # Configuraciones centralizadas
│   └── index.ts      # Configuración de entorno y API
├── constants/        # Constantes del proyecto
│   └── index.ts      # Constantes centralizadas
├── types/           # Definiciones de tipos TypeScript
│   ├── index.ts     # Tipos centralizados y re-exports
│   ├── consulta_sprint.interface.ts
│   ├── consulta_status.interface.ts
│   └── historial-json.interface.ts
├── utils/           # Utilidades y helpers
│   ├── index.ts     # Utilidades centralizadas
│   └── debug-requests.ts
├── services/        # Servicios de negocio
│   ├── sprint.service.ts
│   └── userStory.service.ts
├── scripts/         # Scripts de procesamiento
│   ├── process-historial.ts
│   └── generate-dashboard.ts
├── outputs/         # Archivos generados
│   ├── front/       # Dashboard frontend
│   ├── json/        # Archivos JSON
│   └── txt/         # Archivos de texto
└── main.ts          # Punto de entrada principal
```

## 📋 Descripción de Carpetas

### `config/`
- **Propósito**: Configuraciones centralizadas del proyecto
- **Contenido**: Variables de entorno, endpoints de API, validaciones
- **Archivos**: `index.ts`

### `constants/`
- **Propósito**: Constantes utilizadas en todo el proyecto
- **Contenido**: Colores, rutas de archivos, configuraciones de dashboard
- **Archivos**: `index.ts`

### `types/`
- **Propósito**: Definiciones de tipos TypeScript
- **Contenido**: Interfaces, tipos, re-exports de tipos
- **Archivos**: `index.ts`, interfaces de consulta

### `utils/`
- **Propósito**: Utilidades y funciones helper
- **Contenido**: Formateo de fechas, validaciones, utilidades de archivos
- **Archivos**: `index.ts`, `debug-requests.ts`

### `services/`
- **Propósito**: Lógica de negocio y comunicación con APIs
- **Contenido**: Servicios para sprints y user stories
- **Archivos**: `sprint.service.ts`, `userStory.service.ts`

### `scripts/`
- **Propósito**: Scripts de procesamiento y generación
- **Contenido**: Procesamiento de historial, generación de dashboard
- **Archivos**: `process-historial.ts`, `generate-dashboard.ts`

### `outputs/`
- **Propósito**: Archivos generados por el proyecto
- **Contenido**: Dashboard frontend, archivos JSON, reportes de texto
- **Carpetas**: `front/`, `json/`, `txt/`

## 🔄 Flujo de Datos

1. **Entrada**: `main.ts` → Consulta API de Taiga
2. **Procesamiento**: `services/` → Lógica de negocio
3. **Transformación**: `scripts/` → Procesamiento de datos
4. **Salida**: `outputs/` → Archivos generados

## 📦 Importaciones

### Configuración
```typescript
import { config } from '@/config';
```

### Constantes
```typescript
import { STATUS_COLORS, FILE_PATHS } from '@/constants';
```

### Tipos
```typescript
import { StatusType, ApiResponse } from '@/types';
```

### Utilidades
```typescript
import { formatDate, ensureDirectoryExists } from '@/utils';
```

## 🎯 Beneficios de esta Estructura

- **✅ Modularidad**: Código organizado por responsabilidades
- **✅ Reutilización**: Utilidades y constantes centralizadas
- **✅ Mantenibilidad**: Fácil localización y modificación
- **✅ Escalabilidad**: Estructura preparada para crecimiento
- **✅ Tipado**: TypeScript con tipos centralizados
- **✅ Configuración**: Variables de entorno centralizadas 