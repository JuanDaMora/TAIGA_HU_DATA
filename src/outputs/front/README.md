# 📊 Dashboard Frontend - Estructura Modularizada

**Autor:** Juan David Morantes Vergara

Esta carpeta contiene la implementación frontend modularizada del dashboard de User Stories, separando HTML, CSS y JavaScript para una mejor organización y mantenimiento.

## 🏗️ Estructura de Archivos

```
front/
├── dashboard.html          # Plantilla HTML base con placeholders
├── css/
│   └── dashboard.css       # Estilos CSS completos del dashboard
├── js/
│   └── dashboard.js        # Funcionalidad JavaScript del dashboard
└── README.md              # Este archivo
```

## 📄 Archivos del Dashboard

### `dashboard.html`
- **Plantilla HTML base** con estructura semántica
- **Placeholders** para inserción dinámica de datos
- **Referencias** a archivos CSS y JS externos
- **Responsive design** optimizado para todos los dispositivos

### `css/dashboard.css`
- **Estilos completos** del dashboard
- **Material Design** con paleta de colores consistente
- **Animaciones y transiciones** suaves
- **Media queries** para diseño responsive
- **Estilos de impresión** optimizados

### `js/dashboard.js`
- **Funcionalidad completa** del dashboard
- **Carga dinámica** de datos desde JSON
- **Filtros interactivos** en tiempo real
- **Ordenamiento** de tablas
- **Exportación** a CSV y JSON
- **Gráficos interactivos** con Chart.js

## 🔧 Características Técnicas

### HTML
- **Semántico**: Uso correcto de elementos HTML5
- **Accesible**: Estructura navegable por lectores de pantalla
- **SEO-friendly**: Meta tags y estructura optimizada
- **Placeholders**: Sistema de plantillas para datos dinámicos

### CSS
- **Modular**: Estilos organizados por secciones
- **Responsive**: Grid y Flexbox para layouts adaptativos
- **Performance**: CSS optimizado y minificado
- **Temas**: Fácil personalización de colores y estilos

### JavaScript
- **Modular**: Funciones organizadas y reutilizables
- **Async/Await**: Manejo moderno de promesas
- **Error Handling**: Gestión robusta de errores
- **Performance**: Debouncing y optimizaciones

## 🎨 Diseño y UX

### Material Design
- **Tipografía**: Roboto font family
- **Colores**: Paleta Material Design consistente
- **Elevación**: Sombras y efectos de profundidad
- **Iconografía**: Material Icons integrados

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Adaptación a tablets y desktop
- **Touch Friendly**: Elementos táctiles optimizados
- **Performance**: Carga rápida en todos los dispositivos

### Interactividad
- **Hover Effects**: Feedback visual en interacciones
- **Loading States**: Indicadores de carga
- **Error States**: Manejo elegante de errores
- **Success Feedback**: Confirmaciones de acciones

## 🚀 Funcionalidades

### Visualización de Datos
- **Gráficos interactivos**: Chart.js para visualizaciones
- **Métricas en tiempo real**: Estadísticas actualizadas
- **Tablas ordenables**: Ordenamiento por columnas
- **Filtros avanzados**: Múltiples criterios de filtrado

### Interactividad
- **Búsqueda en tiempo real**: Filtrado instantáneo
- **Ordenamiento dinámico**: Click en columnas para ordenar
- **Filtros combinados**: Múltiples filtros simultáneos
- **Exportación**: Descarga de datos en CSV/JSON

### Performance
- **Lazy Loading**: Carga diferida de componentes
- **Debouncing**: Optimización de búsquedas
- **Caching**: Almacenamiento local de datos
- **Optimización**: Código minificado y optimizado

## 🔧 Personalización

### Modificar Colores
```css
/* En css/dashboard.css */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #4caf50;
    --warning-color: #ff9800;
    --error-color: #f44336;
}
```

### Agregar Nuevos Estados
```javascript
// En js/dashboard.js
const statusColors = {
    'Done': '#4caf50',
    'Develop in progress': '#2196f3',
    'To be tested': '#ff9800',
    'In QA / UX Test': '#9c27b0',
    'Ready for smoke test': '#607d8b',
    'Nuevo Estado': '#f44336'  // Agregar aquí
};
```

### Modificar Layout
```css
/* En css/dashboard.css */
.stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Cambiar tamaño */
}

.charts-section {
    grid-template-columns: 1fr; /* Cambiar a una columna */
}
```

## 🚨 Problema de CORS - Solución

### ⚠️ Error Común
Al abrir `dashboard.html` directamente, aparece el error:
```
Access to fetch at 'file:///...' has been blocked by CORS policy
```

### 🔍 Causa
Los navegadores bloquean peticiones AJAX a archivos locales por seguridad.

### ✅ Soluciones

#### Opción 1: Servidor Local (Recomendado)
```bash
# Generar dashboard y abrir servidor automáticamente
yarn serve-dashboard

# O manualmente:
yarn dashboard
yarn serve
```
Luego abre: http://localhost:8080

#### Opción 2: Live Server (VS Code)
- Instala la extensión "Live Server"
- Click derecho en `dashboard.html` → "Open with Live Server"

#### Opción 3: Servidor HTTP Manual
```bash
# Instalar servidor global
npm install -g http-server

# Navegar a la carpeta y ejecutar
cd src/outputs/front
http-server -p 8080 -o
```

#### ❌ No Funciona
- Abrir `dashboard.html` directamente con doble click
- Usar protocolo `file://`

## 📱 Compatibilidad

### Navegadores Soportados
- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Dispositivos
- **Desktop**: 1920x1080 y superiores
- **Tablet**: 768px - 1024px
- **Mobile**: 320px - 767px

## 🛠️ Desarrollo

### Estructura de Desarrollo
```
front/
├── dashboard.html          # Plantilla base
├── css/
│   ├── dashboard.css       # Estilos principales
│   ├── components.css      # Componentes reutilizables (futuro)
│   └── themes.css          # Temas personalizables (futuro)
├── js/
│   ├── dashboard.js        # Funcionalidad principal
│   ├── charts.js           # Lógica de gráficos (futuro)
│   └── utils.js            # Utilidades (futuro)
└── assets/
    ├── icons/              # Iconos personalizados (futuro)
    └── images/             # Imágenes del dashboard (futuro)
```

### Flujo de Desarrollo
1. **Modificar HTML**: Actualizar estructura en `dashboard.html`
2. **Ajustar CSS**: Modificar estilos en `css/dashboard.css`
3. **Agregar JS**: Implementar funcionalidad en `js/dashboard.js`
4. **Probar**: Verificar en diferentes dispositivos
5. **Optimizar**: Minificar y optimizar para producción

## 🔄 Actualización Automática

El dashboard se actualiza automáticamente cuando:
1. Se ejecuta `yarn start` (nuevos datos de Taiga)
2. Se ejecuta `yarn process` (nuevo procesamiento)
3. Se ejecuta `yarn dashboard` (regeneración del HTML)

## 🐛 Debugging

### Consola del Navegador
```javascript
// Acceder a datos del dashboard
console.log(window.Dashboard);

// Verificar carga de datos
console.log(dashboardData);

// Probar funciones
Dashboard.exportToCSV();
Dashboard.clearFilters();
```

### Herramientas de Desarrollo
- **Chrome DevTools**: Para debugging de JavaScript
- **Firefox Developer Tools**: Para análisis de CSS
- **Lighthouse**: Para auditoría de performance
- **Accessibility**: Para verificar accesibilidad

## 📈 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Temas personalizables**: Modo oscuro/claro
- [ ] **Gráficos adicionales**: Timeline, burndown charts
- [ ] **Filtros avanzados**: Por sprint, asignado, prioridad
- [ ] **Exportación PDF**: Generar reportes en PDF
- [ ] **Notificaciones**: Alertas para historias antiguas
- [ ] **Dashboard en tiempo real**: Actualización automática

### Optimizaciones Técnicas
- [ ] **Service Workers**: Caching offline
- [ ] **Web Components**: Componentes reutilizables
- [ ] **TypeScript**: Tipado estático para JavaScript
- [ ] **Bundling**: Webpack para optimización
- [ ] **Testing**: Tests unitarios y de integración

---

**Desarrollado con ❤️ para el análisis de User Stories de Taiga** 