// Dashboard de User Stories - JavaScript

// Variables globales
let dashboardData = null;
let currentSort = { column: null, direction: 'asc' };
let statusChart = null;
let monthChart = null;

// Función para cargar datos del JSON
async function loadDashboardData() {
    try {
        // Cargar desde la carpeta front
        let response = await fetch('user_stories_report.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawData = await response.json();
        
        // Procesar los datos para el dashboard
        const stories = rawData.recent_user_stories;
        
        // Calcular estadísticas
        const statusCounts = {};
        const ageCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        const monthCounts = {};
        
        stories.forEach(story => {
            // Contar por estado
            if (story.status) {
                statusCounts[story.status] = (statusCounts[story.status] || 0) + 1;
            }
            
            // Contar por edad
            const age = Math.min(story.age_in_months, 4);
            ageCounts[age] = (ageCounts[age] || 0) + 1;
            
            // Contar por mes
            const month = new Date(story.created_date).getMonth() + 1;
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        const completedCount = statusCounts['Done'] || 0;
        const completionRate = ((completedCount / rawData.total_user_stories) * 100).toFixed(1);
        const avgAge = (stories.reduce((sum, story) => sum + story.age_in_months, 0) / stories.length).toFixed(1);
        
        const inProgressCount = (statusCounts['Develop in progress'] || 0) + 
                               (statusCounts['To be tested'] || 0) + 
                               (statusCounts['In QA / UX Test'] || 0) + 
                               (statusCounts['Ready for smoke test'] || 0);

        // Retornar datos procesados
        return {
            stats: {
                total: rawData.total_user_stories,
                completed: completedCount,
                inProgress: inProgressCount,
                completionRate: completionRate,
                avgAge: avgAge
            },
            statusCounts,
            ageCounts,
            monthCounts,
            stories: stories.map(story => ({
                ref: story.ref,
                subject: story.subject,
                status: story.status,
                created_date: story.created_date,
                modified_date: story.modified_date,
                age_in_months: story.age_in_months
            }))
        };
    } catch (error) {
        console.error('Error cargando datos:', error);
        
        // Mostrar mensaje específico para errores CORS
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            showError(`
                <h3>🚫 Error de CORS - Archivo Abierto Directamente</h3>
                <p>El dashboard debe abrirse desde un servidor HTTP, no directamente como archivo.</p>
                <div style="margin: 20px 0;">
                    <strong>Soluciones:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>Opción 1:</strong> Ejecuta <code>yarn serve-dashboard</code> y abre http://localhost:8080</li>
                        <li><strong>Opción 2:</strong> Usa Live Server en VS Code</li>
                        <li><strong>Opción 3:</strong> Instala un servidor local: <code>npm install -g http-server</code></li>
                    </ul>
                </div>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Reintentar
                </button>
            `);
        } else {
            showError('Error al cargar los datos. Verifica que el archivo user_stories_report.json existe.');
        }
        return null;
    }
}

// Función para mostrar errores
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #ffebee;
        color: #c62828;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        border: 1px solid #ffcdd2;
    `;
    errorDiv.innerHTML = `
        <h3>⚠️ Error</h3>
        <p>${message}</p>
        <p><strong>Solución:</strong> Ejecuta <code>yarn process</code> para generar los datos necesarios.</p>
    `;
    container.insertBefore(errorDiv, container.firstChild);
}

// Función para crear gráficos
function createCharts() {
    if (!dashboardData) return;

    // Destruir gráficos existentes si existen
    if (statusChart) {
        statusChart.destroy();
        statusChart = null;
    }
    if (monthChart) {
        monthChart.destroy();
        monthChart = null;
    }

    const statusCounts = dashboardData.statusCounts;
    const monthCounts = dashboardData.monthCounts;

    // Gráfico de distribución por estado
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        '#4caf50', // Done
                        '#2196f3', // Develop in progress
                        '#ff9800', // To be tested
                        '#9c27b0', // In QA
                        '#607d8b'  // Ready
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de distribución por mes
    const monthCtx = document.getElementById('monthChart');
    if (monthCtx) {
        const monthLabels = {
            3: 'Marzo',
            4: 'Abril', 
            5: 'Mayo',
            6: 'Junio',
            7: 'Julio'
        };
        
        monthChart = new Chart(monthCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(monthCounts).map(m => monthLabels[m]),
                datasets: [{
                    label: 'User Stories',
                    data: Object.values(monthCounts),
                    backgroundColor: '#667eea',
                    borderColor: '#764ba2',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `User Stories: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Función para actualizar tabla
function updateTable(stories, filters = {}) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    // Filtrar historias
    let filteredStories = stories.filter(story => {
        const matchesSearch = !filters.search || 
            story.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
            story.ref.toString().includes(filters.search) ||
            (story.status && story.status.toLowerCase().includes(filters.search.toLowerCase()));
        
        const matchesStatus = !filters.status || story.status === filters.status;
        const matchesAge = !filters.age || story.age_in_months === parseInt(filters.age);
        const matchesMonth = !filters.month || {
            '3': story.created_date.startsWith('2025-03'),
            '4': story.created_date.startsWith('2025-04'),
            '5': story.created_date.startsWith('2025-05'),
            '6': story.created_date.startsWith('2025-06'),
            '7': story.created_date.startsWith('2025-07')
        }[filters.month];

        return matchesSearch && matchesStatus && matchesAge && matchesMonth;
    });

    // Aplicar ordenamiento
    if (currentSort.column) {
        filteredStories.sort((a, b) => {
            let aVal, bVal;
            
            switch (currentSort.column) {
                case 'ref':
                    aVal = a.ref;
                    bVal = b.ref;
                    break;
                case 'subject':
                    aVal = a.subject.toLowerCase();
                    bVal = b.subject.toLowerCase();
                    break;
                case 'status':
                    aVal = a.status || '';
                    bVal = b.status || '';
                    break;
                case 'created_date':
                    aVal = new Date(a.created_date);
                    bVal = new Date(b.created_date);
                    break;
                case 'modified_date':
                    aVal = new Date(a.modified_date);
                    bVal = new Date(b.modified_date);
                    break;
                case 'age_in_months':
                    aVal = a.age_in_months;
                    bVal = b.age_in_months;
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Actualizar contador de resultados
    updateResultsCount(filteredStories.length);

    // Generar filas de la tabla
    const rows = filteredStories.map(story => {
        const statusClass = getStatusClass(story.status);
        const createdDate = new Date(story.created_date).toLocaleDateString('es-ES');
        const modifiedDate = new Date(story.modified_date).toLocaleDateString('es-ES');
        
        return `
            <tr>
                <td><a href="#" class="hu-link" onclick="showHUDetail(${story.ref}); return false;">${story.ref}</a></td>
                <td><a href="#" class="hu-link" onclick="showHUDetail(${story.ref}); return false;">${story.subject}</a></td>
                <td><span class="status-badge ${statusClass}">${story.status || 'Sin estado'}</span></td>
                <td>${createdDate}</td>
                <td>${modifiedDate}</td>
                <td>${story.age_in_months}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = rows || '<tr><td colspan="6" class="text-center text-muted">No se encontraron resultados</td></tr>';
}


// Función para actualizar estadísticas del dashboard
function updateDashboardStats(stats) {
    console.log('📊 Actualizando estadísticas del dashboard:', stats);
    
    // Actualizar tarjetas principales
    const totalElement = document.getElementById('totalStories');
    if (totalElement) totalElement.textContent = stats.total;
    
    const completedElement = document.getElementById('completedStories');
    if (completedElement) completedElement.textContent = stats.completed;
    
    const completionRateElement = document.getElementById('completionRate');
    if (completionRateElement) completionRateElement.textContent = `${stats.completionRate}% completadas`;
    
    const inProgressElement = document.getElementById('inProgressStories');
    if (inProgressElement) inProgressElement.textContent = stats.inProgress;
    
    const avgAgeElement = document.getElementById('avgAge');
    if (avgAgeElement) avgAgeElement.textContent = stats.avgAge;
    
    // Actualizar distribución por estado
    const doneCountElement = document.getElementById('doneCount');
    if (doneCountElement) doneCountElement.textContent = stats.completed;
    
    const inProgressCountElement = document.getElementById('inProgressCount');
    if (inProgressCountElement) inProgressCountElement.textContent = dashboardData.statusCounts['Develop in progress'] || 0;
    
    const toTestCountElement = document.getElementById('toTestCount');
    if (toTestCountElement) toTestCountElement.textContent = dashboardData.statusCounts['To be tested'] || 0;
    
    const qaCountElement = document.getElementById('qaCount');
    if (qaCountElement) qaCountElement.textContent = dashboardData.statusCounts['In QA / UX Test'] || 0;
    
    const readyCountElement = document.getElementById('readyCount');
    if (readyCountElement) readyCountElement.textContent = dashboardData.statusCounts['Ready for smoke test'] || 0;
    
    // Actualizar distribución por edad
    const age0Element = document.getElementById('age0');
    if (age0Element) age0Element.textContent = dashboardData.ageCounts[0] || 0;
    
    const age1Element = document.getElementById('age1');
    if (age1Element) age1Element.textContent = dashboardData.ageCounts[1] || 0;
    
    const age2Element = document.getElementById('age2');
    if (age2Element) age2Element.textContent = dashboardData.ageCounts[2] || 0;
    
    const age3Element = document.getElementById('age3');
    if (age3Element) age3Element.textContent = dashboardData.ageCounts[3] || 0;
    
    const age4Element = document.getElementById('age4');
    if (age4Element) age4Element.textContent = dashboardData.ageCounts[4] || 0;
    
    console.log('✅ Estadísticas del dashboard actualizadas');
}

// Función para actualizar contador de resultados
function updateResultsCount(count) {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Función para configurar filtros
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const ageFilter = document.getElementById('ageFilter');
    const monthFilter = document.getElementById('monthFilter');
    const searchInput = document.getElementById('searchInput');

    function applyFilters() {
        const filters = {
            status: statusFilter ? statusFilter.value : '',
            age: ageFilter ? ageFilter.value : '',
            month: monthFilter ? monthFilter.value : '',
            search: searchInput ? searchInput.value : ''
        };
        updateTable(dashboardData.stories, filters);
    }

    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (ageFilter) ageFilter.addEventListener('change', applyFilters);
    if (monthFilter) monthFilter.addEventListener('change', applyFilters);
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
}

// Función debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para configurar ordenamiento de tabla
function setupTableSorting() {
    const table = document.getElementById('userStoriesTable');
    if (!table) return;

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        const columns = ['ref', 'subject', 'status', 'created_date', 'modified_date', 'age_in_months'];
        const column = columns[index];
        
        if (column) {
            header.classList.add('sortable');
            header.addEventListener('click', () => {
                sortTable(column);
            });
        }
    });
}

// Función para ordenar tabla
function sortTable(column) {
    const table = document.getElementById('userStoriesTable');
    if (!table) return;

    // Limpiar clases de ordenamiento anteriores
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });

    // Cambiar dirección si es la misma columna
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    // Agregar clase de ordenamiento
    const headers = table.querySelectorAll('th');
    const columns = ['ref', 'subject', 'status', 'created_date', 'modified_date', 'age_in_months'];
    const index = columns.indexOf(column);
    if (index !== -1) {
        headers[index].classList.add(`sort-${currentSort.direction}`);
    }

    // Aplicar filtros actuales con nuevo ordenamiento
    const statusFilter = document.getElementById('statusFilter');
    const ageFilter = document.getElementById('ageFilter');
    const monthFilter = document.getElementById('monthFilter');
    const searchInput = document.getElementById('searchInput');

    const filters = {
        status: statusFilter ? statusFilter.value : '',
        age: ageFilter ? ageFilter.value : '',
        month: monthFilter ? monthFilter.value : '',
        search: searchInput ? searchInput.value : ''
    };

    updateTable(dashboardData.stories, filters);
}

// Función para exportar a CSV
function exportToCSV() {
    if (!dashboardData) return;

    const headers = ['Ref', 'Título', 'Estado', 'Fecha Creación', 'Última Modificación', 'Edad (meses)'];
    const csvContent = [
        headers.join(','),
        ...dashboardData.stories.map(story => [
            story.ref,
            `"${story.subject.replace(/"/g, '""')}"`,
            story.status || 'Sin estado',
            story.created_date,
            story.modified_date,
            story.age_in_months
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, `user_stories_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}

// Función para exportar a JSON
function exportToJSON() {
    if (!dashboardData) return;

    const jsonContent = JSON.stringify(dashboardData, null, 2);
    downloadFile(jsonContent, `user_stories_dashboard_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

// Función auxiliar para descargar archivos
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Función para limpiar filtros
function clearFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const ageFilter = document.getElementById('ageFilter');
    const monthFilter = document.getElementById('monthFilter');
    const searchInput = document.getElementById('searchInput');

    if (statusFilter) statusFilter.value = '';
    if (ageFilter) ageFilter.value = '';
    if (monthFilter) monthFilter.value = '';
    if (searchInput) searchInput.value = '';

    updateTable(dashboardData.stories, {});
}

// Función para configurar eventos de exportación
function setupExportButtons() {
    const csvBtn = document.getElementById('exportCSV');
    const jsonBtn = document.getElementById('exportJSON');
    const clearBtn = document.getElementById('clearFilters');

    if (csvBtn) csvBtn.addEventListener('click', exportToCSV);
    if (jsonBtn) jsonBtn.addEventListener('click', exportToJSON);
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
}

// Función para mostrar/ocultar secciones
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('hidden');
    }
}

// Función para inicializar el dashboard
async function initDashboard() {
    try {
        // Mostrar loading
        showLoading();

        // Cargar datos
        const data = await loadDashboardData();
        if (!data) {
            return;
        }

        dashboardData = data;

        // Actualizar elementos del DOM con las estadísticas
        updateDashboardStats(data.stats);

        // Crear gráficos
        createCharts();

        // Configurar filtros
        setupFilters();

        // Configurar ordenamiento de tabla
        setupTableSorting();

        // Configurar botones de exportación
        setupExportButtons();

        // Cargar tabla inicial
        updateTable(data.stories);

        // Ocultar loading
        hideLoading();

        console.log('✅ Dashboard inicializado correctamente');

    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
        hideLoading();
        showError('Error inicializando el dashboard. Revisa la consola para más detalles.');
    }
}

// Función para mostrar loading
function showLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
}

// Función para ocultar loading
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Función para actualizar timestamp
function updateTimestamp() {
    const timestampElement = document.querySelector('.header .timestamp');
    if (timestampElement) {
        timestampElement.textContent = `Generado el: ${new Date().toLocaleString('es-ES')}`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Dashboard de User Stories...');
    updateTimestamp();
    initDashboard();
});

// Exportar funciones para uso global
window.Dashboard = {
    exportToCSV,
    exportToJSON,
    clearFilters,
    toggleSection,
    updateTable,
    createCharts
};

// ===== FUNCIONES PARA EL DETALLE DE HU =====

// Variables globales para el detalle
let currentHUData = null;
let currentTimelineData = [];

// Función para mostrar el detalle de una HU
async function showHUDetail(huRef) {
    console.log(`🔍 DEBUG: Mostrando detalle para HU ${huRef}`);
    
    try {
        // Ocultar dashboard y mostrar sección de detalle
        hideDashboard();
        showDetailSection();
        
        // Hacer scroll suave hacia la sección de detalle
        const detailSection = document.getElementById('huDetailSection');
        if (detailSection) {
            detailSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        // Mostrar loading del detalle
        showDetailLoading();
        
        // Cargar datos de la HU
        await loadHUData(huRef);
        
        // Cargar timeline detallado
        await loadTimelineData(huRef);
        
        // Renderizar todo
        renderDetailPage();
        
    } catch (error) {
        console.error('❌ Error mostrando detalle:', error);
        showDetailError('Error cargando los datos de la User Story');
    }
}

// Función para cargar datos básicos de la HU
async function loadHUData(huRef) {
    console.log(`📋 DEBUG: Cargando datos básicos para HU ${huRef}`);
    
    const response = await fetch('user_stories_report.json');
    if (!response.ok) {
        throw new Error('No se pudo cargar el reporte de User Stories');
    }
    
    const data = await response.json();
    const hu = data.recent_user_stories.find(story => story.ref === parseInt(huRef));
    
    if (!hu) {
        throw new Error(`No se encontró la User Story con referencia ${huRef}`);
    }
    
    currentHUData = hu;
    console.log(`✅ DEBUG: Datos de HU cargados:`, currentHUData);
}

// Función para cargar timeline detallado desde complete_timeline.json
async function loadTimelineData(huRef) {
    console.log(`📅 Cargando timeline para HU ${huRef}`);
    
    try {
        const timelineUrl = 'complete_timeline.json?v=' + Date.now();
        console.log(`🔗 Intentando cargar: ${timelineUrl}`);
        const response = await fetch(timelineUrl);
        if (!response.ok) {
            throw new Error('No se pudo cargar el timeline completo');
        }
        
        const timelineData = await response.json();
        const huChanges = timelineData.changes_by_ref[huRef];
        
        if (huChanges && huChanges.length > 0) {
            console.log(`✅ Encontrados ${huChanges.length} cambios para HU ${huRef}`);
            
            // Procesar los cambios del timeline usando created_date para la cronología real
            currentTimelineData = huChanges.map(change => ({
                id: change.change_id,
                status: change.status,
                date: new Date(change.created_date), // Usar created_date para la fecha real del cambio
                subject: change.subject,
                ref: change.ref,
                isFirst: change.is_first,
                isLast: change.is_last
            }));
            
            // Ordenar por fecha (más antigua primero)
            currentTimelineData.sort((a, b) => a.date - b.date);
            
            console.log(`✅ Timeline procesado con ${currentTimelineData.length} cambios únicos`);
        } else {
            console.log(`⚠️ No se encontraron cambios para HU ${huRef}, creando timeline básico`);
            createBasicTimeline();
        }
        
    } catch (error) {
        console.error('❌ Error cargando timeline:', error);
        createBasicTimeline();
    }
}

// Función para crear timeline básico cuando no hay datos detallados
function createBasicTimeline() {
    console.log('⚠️ Creando timeline básico');
    
    if (!currentHUData) {
        console.error('❌ No hay datos de HU para crear timeline básico');
        return;
    }
    
    const createdDate = new Date(currentHUData.created_date);
    const modifiedDate = new Date(currentHUData.modified_date);
    
    currentTimelineData = [
        {
            id: 1,
            status: 'Open / Ready for sprint',
            date: createdDate,
            subject: currentHUData.subject,
            ref: currentHUData.ref,
            isFirst: true,
            isLast: currentHUData.status === 'Open / Ready for sprint'
        }
    ];
    
    // Agregar estado actual si es diferente del inicial
    if (currentHUData.status !== 'Open / Ready for sprint') {
        currentTimelineData.push({
            id: 2,
            status: currentHUData.status,
            date: modifiedDate,
            subject: currentHUData.subject,
            ref: currentHUData.ref,
            isFirst: false,
            isLast: true
        });
    }
    
    console.log(`📅 Timeline básico creado con ${currentTimelineData.length} elementos`);
}

// Función para renderizar toda la página de detalle
function renderDetailPage() {
    console.log('🎨 Renderizando página de detalle');
    
    if (!currentHUData) {
        showDetailError('No hay datos de HU para renderizar');
        return;
    }
    
    // Ocultar loading del detalle
    hideDetailLoading();
    
    // Renderizar información de la HU
    renderHUInfo();
    
    // Renderizar timeline
    renderTimeline();
    
    // Mostrar secciones
    showHUInfo();
    showTimeline();
    
    console.log('✅ Página de detalle renderizada completamente');
}

// Función para renderizar información de la HU
function renderHUInfo() {
    console.log('📋 Renderizando información de HU');
    
    const hu = currentHUData;
    
    // Calcular tiempo vivo desde la creación hasta hoy
    let createdDate;
    
    if (currentTimelineData && currentTimelineData.length > 0) {
        // Usar la fecha más antigua del timeline como fecha de creación
        createdDate = currentTimelineData[0].date;
    } else {
        // Fallback a los datos básicos de la HU
        createdDate = new Date(hu.created_date);
    }
    
    // Calcular tiempo vivo desde la creación hasta hoy
    const today = new Date();
    const ageInDays = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Cálculo tiempo vivo:`, {
        createdDate: createdDate.toISOString(),
        today: today.toISOString(),
        ageInDays: ageInDays
    });
    
    // Actualizar elementos del DOM
    document.getElementById('huName').textContent = hu.subject;
    document.getElementById('huRef').textContent = hu.ref;
    document.getElementById('huStatusBadge').textContent = hu.status;
    document.getElementById('huStatusBadge').className = `status-badge ${getStatusClass(hu.status)}`;
    document.getElementById('huAge').textContent = `${ageInDays} días`;
    document.getElementById('huCreated').textContent = formatDate(createdDate);
    document.getElementById('huModified').textContent = formatDate(today);
    document.getElementById('huChanges').textContent = currentTimelineData ? currentTimelineData.length : 0;
}

// Función para renderizar timeline
function renderTimeline() {
    console.log(`📅 Renderizando timeline con ${currentTimelineData.length} elementos`);
    
    const timelineContainer = document.getElementById('timeline');
    if (!timelineContainer) {
        console.error('❌ No se encontró el contenedor del timeline');
        return;
    }
    
    // Limpiar timeline
    timelineContainer.innerHTML = '';
    
    // Generar HTML para cada elemento del timeline
    currentTimelineData.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const statusClass = getStatusClass(item.status);
        const isLast = index === currentTimelineData.length - 1;
        const isFirst = index === 0;
        
        timelineItem.innerHTML = `
            <div class="timeline-dot ${statusClass} ${isLast ? 'current' : ''} ${isFirst ? 'first' : ''}"></div>
            <div class="timeline-content">
                <div class="timeline-status">${item.status}</div>
                <div class="timeline-date">${formatDate(item.date)}</div>
                ${isFirst ? '<div class="timeline-badge">Inicio</div>' : ''}
                ${isLast ? '<div class="timeline-badge">Actual</div>' : ''}
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
    
    console.log('✅ Timeline renderizado correctamente');
}

// Función para obtener clase CSS del estado
function getStatusClass(status) {
    const statusMap = {
        'Open / Ready for sprint': 'open-ready',
        'Develop in progress': 'develop-in-progress',
        'To be tested': 'to-be-tested',
        'Ready for smoke test': 'ready-smoke',
        'QA-tests failed': 'qa-failed',
        'Done': 'done'
    };
    return statusMap[status] || 'default';
}



// Función para formatear fecha
function formatDate(date) {
    if (!date || isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si es hoy, mostrar "Hoy"
    if (diffDays === 0) {
        return 'Hoy';
    }
    
    // Si es ayer, mostrar "Ayer"
    if (diffDays === 1) {
        return 'Ayer';
    }
    
    // Si es reciente (menos de 7 días), mostrar "Hace X días"
    if (diffDays < 7) {
        return `Hace ${diffDays} días`;
    }
    
    // Para fechas más antiguas, mostrar fecha completa
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para formatear hora
function formatTime(date) {
    return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Función para mostrar el dashboard
function showDashboard() {
    const detailSection = document.getElementById('huDetailSection');
    
    // Agregar clase para animación de salida
    if (detailSection) {
        detailSection.classList.add('hiding');
    }
    
    // Hacer scroll suave hacia el inicio del dashboard
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
    
    // Esperar a que termine la animación de salida y el scroll
    setTimeout(() => {
        document.querySelector('.container > div:not(#huDetailSection)').style.display = 'block';
        if (detailSection) {
            detailSection.style.display = 'none';
            detailSection.classList.remove('hiding');
        }
    }, 500);
}

// Función para ocultar el dashboard
function hideDashboard() {
    document.querySelector('.container > div:not(#huDetailSection)').style.display = 'none';
    document.getElementById('huDetailSection').style.display = 'block';
}

// Función para mostrar la sección de detalle
function showDetailSection() {
    document.getElementById('huDetailSection').style.display = 'block';
}

// Función para mostrar loading del detalle
function showDetailLoading() {
    document.getElementById('detailLoading').style.display = 'flex';
    document.getElementById('huInfo').style.display = 'none';
    document.getElementById('timelineSection').style.display = 'none';
    document.getElementById('detailErrorSection').style.display = 'none';
}

// Función para ocultar loading del detalle
function hideDetailLoading() {
    document.getElementById('detailLoading').style.display = 'none';
}

// Función para mostrar información de HU
function showHUInfo() {
    document.getElementById('huInfo').style.display = 'block';
}

// Función para mostrar timeline
function showTimeline() {
    document.getElementById('timelineSection').style.display = 'block';
}

// Función para mostrar error del detalle
function showDetailError(message) {
    hideDetailLoading();
    document.getElementById('detailErrorMessage').textContent = message;
    document.getElementById('detailErrorSection').style.display = 'block';
}

// Configurar eventos del detalle
function setupDetailEvents() {
    const backButton = document.getElementById('backToDashboard');
    if (backButton) {
        backButton.addEventListener('click', showDashboard);
    }
}

// Configurar eventos del detalle en la inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Dashboard de User Stories...');
    updateTimestamp();
    initDashboard();
    setupDetailEvents();
}); 