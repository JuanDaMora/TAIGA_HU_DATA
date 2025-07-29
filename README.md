# Taiga HU States

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
│   │   └── consulta_status.interface.ts    # Interfaces para historial
│   ├── services/
│   │   ├── sprint.service.ts               # Servicio para consultar sprints
│   │   └── userStory.service.ts            # Servicio para historial de US
│   ├── outputs/                            # Carpeta generada con resultados
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

### Ejecución

```bash
# Compila y ejecuta el proyecto
yarn start

# O alternativamente
npm run start
```

### Scripts Disponibles

```bash
# Compilar TypeScript
yarn build

# Ejecutar (compila y ejecuta)
yarn start

# Debug de peticiones HTTP (para troubleshooting)
yarn debug
```

## 📊 Salida del Programa

El programa genera tres archivos en la carpeta `src/outputs/`:

### 1. `sprints_log.txt`
Contiene información detallada de cada sprint:
```
Sprint ID: 123 - Sprint 1
  - User Story ref: 456 | subject: Implementar login
  - User Story ref: 457 | subject: Crear dashboard
```

### 2. `user_story_ids.txt`
Lista de IDs de todas las user stories encontradas:
```
456
457
458
```

### 3. `historial_estados.txt`
Historial cronológico de cambios de estado de cada user story:
```
Story ref: 456 - Implementar login | Date: 2024-01-15T10:30:00Z | Status: En Progreso
Story ref: 456 - Implementar login | Date: 2024-01-16T14:20:00Z | Status: Terminado
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

### Exportación de Datos
- Genera archivos de texto legibles
- Organiza información de forma estructurada
- Facilita análisis posterior de datos

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

## 🔧 Desarrollo

### Compilación
```bash
# Compilar TypeScript a JavaScript
yarn build
```

### Estructura de Desarrollo
- **Interfaces**: Definiciones de tipos TypeScript
- **Servicios**: Lógica de comunicación con API
- **Main**: Orquestación del flujo principal

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
